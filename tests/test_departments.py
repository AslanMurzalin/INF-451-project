def test_list_departments(client, student_headers, test_department):
    response = client.get("/api/v1/departments", headers=student_headers)
    assert response.status_code == 200
    depts = response.json()
    assert len(depts) >= 1
    assert any(d["name"] == test_department.name for d in depts)


def test_create_department_admin(client, admin_headers):
    response = client.post(
        "/api/v1/departments",
        headers=admin_headers,
        json={"name": "Cybersecurity & Cryptography"}
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Cybersecurity & Cryptography"


def test_create_department_forbidden_for_student(client, student_headers):
    response = client.post(
        "/api/v1/departments",
        headers=student_headers,
        json={"name": "Unauthorized Dept"}
    )
    assert response.status_code == 403


def test_get_department_detail(client, student_headers, test_department):
    response = client.get(
        f"/api/v1/departments/{test_department.department_id}",
        headers=student_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == test_department.name
    assert "user_count" in data
    assert "course_count" in data


def test_update_department_admin(client, admin_headers, test_department):
    response = client.put(
        f"/api/v1/departments/{test_department.department_id}",
        headers=admin_headers,
        json={"name": "Renamed Department"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Renamed Department"


def test_delete_department_admin(client, admin_headers):
    # First create one to delete
    create_res = client.post(
        "/api/v1/departments",
        headers=admin_headers,
        json={"name": "Dept To Delete"}
    )
    dept_id = create_res.json()["department_id"]

    del_res = client.delete(f"/api/v1/departments/{dept_id}", headers=admin_headers)
    assert del_res.status_code == 200
    assert "deleted successfully" in del_res.json()["message"]
