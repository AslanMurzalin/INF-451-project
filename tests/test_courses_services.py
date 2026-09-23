def test_create_course_admin(client, admin_headers, lecturer_user, test_department):
    response = client.post(
        "/api/v1/courses",
        headers=admin_headers,
        json={
            "title": "CS101 - Intro to Computer Science",
            "lecturer_id": lecturer_user.user_id,
            "department_id": test_department.department_id
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "CS101 - Intro to Computer Science"
    assert data["lecturer_name"] == lecturer_user.full_name
    assert data["department_name"] == test_department.name


def test_list_courses_with_filter(client, student_headers, admin_headers, lecturer_user, test_department):
    client.post(
        "/api/v1/courses",
        headers=admin_headers,
        json={
            "title": "CS201 - Data Structures",
            "lecturer_id": lecturer_user.user_id,
            "department_id": test_department.department_id
        }
    )

    response = client.get(
        f"/api/v1/courses?department_id={test_department.department_id}",
        headers=student_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any(c["title"] == "CS201 - Data Structures" for c in data["items"])


def test_create_service_admin(client, admin_headers):
    response = client.post(
        "/api/v1/services",
        headers=admin_headers,
        json={
            "name": "Science Library Branch",
            "category": "Library"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Science Library Branch"
    assert data["category"] == "Library"


def test_list_services_by_category(client, student_headers, admin_headers):
    client.post(
        "/api/v1/services",
        headers=admin_headers,
        json={
            "name": "North Quad Dining Hall",
            "category": "Cafeteria"
        }
    )

    response = client.get(
        "/api/v1/services?category=Cafeteria",
        headers=student_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert all("cafeteria" in s["category"].lower() for s in data["items"])


def test_list_service_categories(client, student_headers, admin_headers):
    client.post(
        "/api/v1/services",
        headers=admin_headers,
        json={
            "name": "Campus IT Repair Shop",
            "category": "TechSupport"
        }
    )

    response = client.get("/api/v1/services/categories", headers=student_headers)
    assert response.status_code == 200
    categories = response.json()
    assert "TechSupport" in categories
