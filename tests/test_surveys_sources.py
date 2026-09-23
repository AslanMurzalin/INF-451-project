from datetime import datetime, timedelta, timezone


def test_create_survey_lecturer(client, lecturer_headers):
    now = datetime.now(timezone.utc)
    start_date = (now - timedelta(days=1)).isoformat()
    end_date = (now + timedelta(days=14)).isoformat()

    response = client.post(
        "/api/v1/surveys",
        headers=lecturer_headers,
        json={
            "title": "Module Midterm Survey",
            "start_date": start_date,
            "end_date": end_date
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Module Midterm Survey"
    assert data["is_active"] is True


def test_create_survey_invalid_dates(client, lecturer_headers):
    now = datetime.now(timezone.utc)
    # end_date before start_date
    start_date = (now + timedelta(days=10)).isoformat()
    end_date = (now + timedelta(days=2)).isoformat()

    response = client.post(
        "/api/v1/surveys",
        headers=lecturer_headers,
        json={
            "title": "Invalid Date Survey",
            "start_date": start_date,
            "end_date": end_date
        }
    )
    assert response.status_code == 422


def test_list_surveys_filter_active(client, student_headers, lecturer_headers):
    now = datetime.now(timezone.utc)
    # create active
    client.post(
        "/api/v1/surveys",
        headers=lecturer_headers,
        json={
            "title": "Active Survey For Testing",
            "start_date": (now - timedelta(days=2)).isoformat(),
            "end_date": (now + timedelta(days=5)).isoformat()
        }
    )

    response = client.get("/api/v1/surveys?status=active", headers=student_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any(s["title"] == "Active Survey For Testing" for s in data["items"])


def test_get_feedback_source_types(client, student_headers):
    response = client.get("/api/v1/sources/types", headers=student_headers)
    assert response.status_code == 200
    types = response.json()
    assert len(types) == 3
    source_names = [t["source_type"] for t in types]
    assert "course_evaluation" in source_names
    assert "survey" in source_names
    assert "service_review" in source_names


def test_get_feedback_sources_summary(client, admin_headers):
    response = client.get("/api/v1/sources/summary", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_courses" in data
    assert "total_services" in data
    assert "active_surveys" in data
    assert "source_types" in data
