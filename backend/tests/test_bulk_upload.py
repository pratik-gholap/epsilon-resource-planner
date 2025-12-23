import sys
import tempfile
import unittest
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

import backend as backend_module


class BulkUploadAssignmentsTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "test.db"
        config = backend_module.DatabaseConfig(sqlite_url=f"sqlite:///{db_path}")
        self.api = backend_module.ResourcePlannerAPI(config)
        self.api.init_database()
        self.client = self.api.app.test_client()

    def tearDown(self):
        self.temp_dir.cleanup()

    def _create_client_person_project(self):
        client_response = self.client.post("/api/clients", json={"name": "Acme Corp"})
        self.assertEqual(client_response.status_code, 201)
        client_id = client_response.get_json()["id"]

        person_response = self.client.post(
            "/api/people",
            json={"name": "John Doe", "role": "Engineer"},
        )
        self.assertEqual(person_response.status_code, 201)
        person_id = person_response.get_json()["id"]

        project_response = self.client.post(
            "/api/projects",
            json={"name": "Website Redesign", "clientId": client_id},
        )
        self.assertEqual(project_response.status_code, 201)
        project_id = project_response.get_json()["id"]

        return client_id, person_id, project_id

    def test_bulk_upload_assignments_by_name(self):
        self._create_client_person_project()

        payload = {
            "assignments": [
                {
                    "person_name": "John Doe",
                    "project_name": "Website Redesign",
                    "client_name": "Acme Corp",
                    "start_date": "2024-01-01",
                    "end_date": "2024-01-31",
                    "percentage": 50,
                }
            ]
        }

        response = self.client.post("/api/bulk-upload/assignments", json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(len(data["added"]), 1)
        self.assertEqual(data["added"][0]["percentage"], 50)

    def test_bulk_upload_assignments_by_id(self):
        _, person_id, project_id = self._create_client_person_project()

        payload = {
            "assignments": [
                {
                    "person_id": person_id,
                    "project_id": project_id,
                    "start_date": "2024-02-01",
                    "end_date": "2024-02-28",
                    "percentage": "75",
                }
            ]
        }

        response = self.client.post("/api/bulk-upload/assignments", json=payload)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data["added"][0]["percentage"], 75)
