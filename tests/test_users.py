def test_list_users_admin(client, admin_headers):
    response = client.get("/api/v1/users", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 1


def test_list_users_forbidden_student(client, student_headers):
    response = client.get("/api/v1/users", headers=student_headers)
    assert response.status_code == 403


def test_create_user_admin(client, admin_headers, test_department):
    response = client.post(
        "/api/v1/users",
        headers=admin_headers,
        json={
            "full_name": "Created Lecturer",
            "email": "created.lecturer@university.edu",
            "password": "Password123!",
            "role": "lecturer",
            "department_id": test_department.department_id
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "created.lecturer@university.edu"
    assert data["role"] == "lecturer"


def test_get_user_by_id_self(client, student_headers, student_user):
    response = client.get(f"/api/v1/users/{student_user.user_id}", headers=student_headers)
    assert response.status_code == 200
    assert response.json()["email"] == student_user.email


def test_get_other_user_by_id_forbidden_student(client, student_headers, admin_user):
    response = client.get(f"/api/v1/users/{admin_user.user_id}", headers=student_headers)
    assert response.status_code == 403


def test_update_user_admin(client, admin_headers, student_user):
    response = client.put(
        f"/api/v1/users/{student_user.user_id}",
        headers=admin_headers,
        json={"full_name": "Promoted Student", "role": "lecturer"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Promoted Student"
    assert data["role"] == "lecturer"


def test_delete_user_admin(client, admin_headers, test_department):
    # Create user to delete
    create_res = client.post(
        "/api/v1/users",
        headers=admin_headers,
        json={
            "full_name": "Temporary User",
            "email": "temp.user@university.edu",
            "password": "Password123!",
            "role": "student",
            "department_id": test_department.department_id
        }
    )
    temp_id = create_res.json()["user_id"]

    del_res = client.delete(f"/api/v1/users/{temp_id}", headers=admin_headers)
    assert del_res.status_code == 200
    assert "deleted successfully" in del_res.json()["message"]
