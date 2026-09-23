def test_register_student(client, test_department):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "New Student",
            "email": "new.student@university.edu",
            "password": "Password123!",
            "role": "student",
            "department_id": test_department.department_id
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "new.student@university.edu"
    assert data["role"] == "student"
    assert data["department_id"] == test_department.department_id


def test_register_admin_requires_secret(client, test_department):
    # Attempting to register admin without secret -> 403 Forbidden
    fail_res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Rogue Admin",
            "email": "rogue.admin@university.edu",
            "password": "Password123!",
            "role": "admin"
        }
    )
    assert fail_res.status_code == 403
    assert "admin_secret" in fail_res.json()["detail"]

    # Register admin with correct secret -> 201 Created
    success_res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Legit Admin",
            "email": "legit.admin@university.edu",
            "password": "Password123!",
            "role": "admin",
            "admin_secret": "admin-secret-dev-key"
        }
    )
    assert success_res.status_code == 201
    assert success_res.json()["role"] == "admin"


def test_register_duplicate_email(client, student_user):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Duplicate Student",
            "email": student_user.email,
            "password": "Password123!",
            "role": "student"
        }
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_json_success(client, student_user):
    # Option 1: JSON Login
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": student_user.email,
            "password": "StudentPass123!"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["email"] == student_user.email
    assert data["role"] == "student"
    # Check HttpOnly Lax cookie
    assert "access_token" in response.cookies


def test_login_oauth2_form_success(client, student_user):
    # Option 2: OAuth2 Password Form Login
    response = client.post(
        "/api/v1/auth/token",
        data={
            "username": student_user.email,
            "password": "StudentPass123!"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert "access_token" in response.cookies


def test_login_invalid_password(client, student_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": student_user.email,
            "password": "WrongPassword!"
        }
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_get_current_user_profile_via_bearer(client, student_headers, student_user):
    response = client.get("/api/v1/auth/me", headers=student_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == student_user.email
    assert data["full_name"] == student_user.full_name


def test_get_current_user_profile_via_cookie(client, student_user):
    # Login to set cookie
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": student_user.email, "password": "StudentPass123!"}
    )
    assert "access_token" in login_res.cookies

    # Call /me without Authorization header (relies solely on cookie)
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 200
    assert res.json()["email"] == student_user.email


def test_refresh_token_flow(client, student_user):
    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": student_user.email, "password": "StudentPass123!"}
    )
    refresh_token = login_res.json()["refresh_token"]

    refresh_res = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert refresh_res.status_code == 200
    data = refresh_res.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_logout_clears_cookie(client, student_user):
    # Login first
    client.post(
        "/api/v1/auth/login",
        json={"email": student_user.email, "password": "StudentPass123!"}
    )
    # Logout
    logout_res = client.post("/api/v1/auth/logout")
    assert logout_res.status_code == 200
    assert "logged out" in logout_res.json()["message"]


def test_update_current_user_profile(client, student_headers):
    response = client.put(
        "/api/v1/auth/me",
        headers=student_headers,
        json={"full_name": "Updated Student Name"}
    )
    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated Student Name"


def test_change_password(client, student_headers, student_user):
    # Change password
    response = client.post(
        "/api/v1/auth/change-password",
        headers=student_headers,
        json={
            "current_password": "StudentPass123!",
            "new_password": "NewSecretPass456!"
        }
    )
    assert response.status_code == 200
    assert "Password changed successfully" in response.json()["message"]

    # Verify old password no longer works
    fail_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": student_user.email,
            "password": "StudentPass123!"
        }
    )
    assert fail_res.status_code == 401

    # Verify new password works
    success_res = client.post(
        "/api/v1/auth/login",
        json={
            "email": student_user.email,
            "password": "NewSecretPass456!"
        }
    )
    assert success_res.status_code == 200
