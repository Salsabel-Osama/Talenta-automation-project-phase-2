from jsonschema import validate
from jsonschema.exceptions import ValidationError

from schemas import SCHEMAS


def get_schema(schema_name: str):
    """Return the requested JSON schema."""

    if schema_name not in SCHEMAS:
        raise ValueError(f"Schema '{schema_name}' not found.")

    return SCHEMAS[schema_name]


def validate_request(schema_name: str, data: dict):
    """Validate request data."""

    schema = get_schema(schema_name)

    validate(
        instance=data,
        schema=schema
    )


def is_valid(schema_name: str, data: dict) -> bool:
    """Return True if request is valid."""

    try:
        validate_request(schema_name, data)
        return True

    except ValidationError:
        return False


def validate_or_raise(schema_name: str, data: dict):
    """Validate request and raise readable error."""

    try:
        validate_request(schema_name, data)

    except ValidationError as e:
        raise ValueError(f"Validation Error: {e.message}")