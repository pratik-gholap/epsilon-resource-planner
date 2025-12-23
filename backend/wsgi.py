from backend import DatabaseConfig, ResourcePlannerAPI

config = DatabaseConfig()
api = ResourcePlannerAPI(config)
api.init_database()

app = api.app
