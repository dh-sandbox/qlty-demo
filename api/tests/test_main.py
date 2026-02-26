"""Tests for FastAPI endpoints."""

from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)


class TestRootEndpoint:
    """Tests for the root health-check endpoint."""

    def test_root_returns_ok(self) -> None:
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "qlty-demo-api"


class TestValidateEmailEndpoint:
    """Tests for the POST /validate/email endpoint."""

    def test_valid_email(self) -> None:
        response = client.post("/validate/email", json={"email": "user@example.com"})
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["errors"] == []

    def test_invalid_email(self) -> None:
        response = client.post("/validate/email", json={"email": "bad-email"})
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert len(data["errors"]) > 0

    def test_empty_email(self) -> None:
        response = client.post("/validate/email", json={"email": ""})
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False

    def test_missing_body(self) -> None:
        response = client.post("/validate/email", json={})
        assert response.status_code == 422


class TestValidatePasswordEndpoint:
    """Tests for the POST /validate/password endpoint."""

    def test_strong_password(self) -> None:
        response = client.post("/validate/password", json={"password": "Str0ng!Pass"})
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["errors"] == []

    def test_weak_password(self) -> None:
        response = client.post("/validate/password", json={"password": "weak"})
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert len(data["errors"]) > 0

    def test_missing_body(self) -> None:
        response = client.post("/validate/password", json={})
        assert response.status_code == 422


class TestGetUserEndpoint:
    """Tests for the GET /users/{user_id} endpoint."""

    def test_get_existing_user(self) -> None:
        response = client.get("/users/1")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 1
        assert data["username"] == "alice"
        assert data["email"] == "alice@example.com"
        assert data["is_active"] is True

    def test_get_second_user(self) -> None:
        response = client.get("/users/2")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == 2
        assert data["username"] == "bob"
        assert data["is_active"] is False

    def test_user_not_found(self) -> None:
        response = client.get("/users/999")
        assert response.status_code == 404
        assert response.json()["detail"] == "User not found"

    def test_invalid_user_id_type(self) -> None:
        response = client.get("/users/abc")
        assert response.status_code == 422
