from pydantic import BaseModel, Field
from typing import Optional
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        from pydantic_core import core_schema as cs
        return cs.json_or_python_schema(
            json_schema=cs.str_schema(),
            python_schema=cs.is_instance_schema(ObjectId),
            serialization=cs.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

class User(BaseModel):
    id: Optional[PyObjectId] = Field(alias='_id')
    email: str
    password: str

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str
        }