from database import engine
import models

def init_db():
    models.Base.metadata.drop_all(bind=engine)
    models.Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db() 