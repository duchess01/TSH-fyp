extractorExampleReq1 = {
    "name" : "BaseEntityExtractor",
    "description" : "this is a base entity extractor",
    "schema" : {
    "properties": {
        "product_name": {
            "description": "Name of the product",
            "title": "Product Name",
            "type": "string"
        },
        "category": {
            "description": "Category of the product, e.g. electronics, clothing",
            "title": "Category",
            "type": "string"
        },
        "specification": {
            "description": "Specification details of the product, e.g. dimensions, weight",
            "title": "Specification",
            "type": "string"
        },
        "price": {
            "description": "Price of the product",
            "title": "Price",
            "type": "string"
        }
    },
    "required": ["product_name", "category", "specification", "price"],
    "title": "ProductData",
    "type": "object"
},
"instruction" : "### Instruction for BaseEntityExtractor\n\n**Purpose:**\nThis extractor is designed to handle product data extraction based on the provided JSON schema. It ensures that the product information adheres to the specified structure and requirements.\n\n**Schema Details:**\n- **`product_name`**: The name of the product. This field is required and must be a string.\n- **`category`**: The category of the product (e.g., electronics, clothing). This field is required and must be a string.\n- **`specification`**: Details about the product's specifications (e.g., dimensions, weight). This field is required and must be a string.\n- **`price`**: The price of the product. This field is required and must be a string.\n\n**Usage:**\n1. **Data Input:** When providing product data, ensure all fields (`product_name`, `category`, `specification`, `price`) are included and correctly formatted according to the schema.\n2. **Validation:** Validate the data against this schema to ensure compliance with all requirements before processing.\n3. **Example Input:**\n   ```json\n   {\n       \"product_name\": \"Smartphone\",\n       \"category\": \"Electronics\",\n       \"specification\": \"64GB storage, 6GB RAM\",\n       \"price\": \"$299.99\"\n   }\n   ```\n\n**Notes:**\n- Ensure all required fields are present and properly formatted.\n- The `price` field should accommodate various currency symbols and formats."

}

extractorExampleRes1 = {
    "status_code": 201,
    "message": "Extractor created successfully",
    "data": {
        "uuid": "0347bbc5-6421-4fa3-af1b-c14320bad571",
        "extractor_data": {
            "name": "baseentityextractor",
            "description": "this is a base entity extractor",
            "schema": {
                "properties": {
                    "product_name": {
                        "description": "Name of the product",
                        "title": "Product Name",
                        "type": "string"
                    },
                    "category": {
                        "description": "Category of the product, e.g. electronics, clothing",
                        "title": "Category",
                        "type": "string"
                    },
                    "specification": {
                        "description": "Specification details of the product, e.g. dimensions, weight",
                        "title": "Specification",
                        "type": "string"
                    },
                    "price": {
                        "description": "Price of the product",
                        "title": "Price",
                        "type": "string"
                    }
                },
                "required": [
                    "product_name",
                    "category",
                    "specification",
                    "price"
                ],
                "title": "ProductData",
                "type": "object"
            },
            "instruction": "### Instruction for BaseEntityExtractor\n\n**Purpose:**\nThis extractor is designed to handle product data extraction based on the provided JSON schema. It ensures that the product information adheres to the specified structure and requirements.\n\n**Schema Details:**\n- **`product_name`**: The name of the product. This field is required and must be a string.\n- **`category`**: The category of the product (e.g., electronics, clothing). This field is required and must be a string.\n- **`specification`**: Details about the product's specifications (e.g., dimensions, weight). This field is required and must be a string.\n- **`price`**: The price of the product. This field is required and must be a string.\n\n**Usage:**\n1. **Data Input:** When providing product data, ensure all fields (`product_name`, `category`, `specification`, `price`) are included and correctly formatted according to the schema.\n2. **Validation:** Validate the data against this schema to ensure compliance with all requirements before processing.\n3. **Example Input:**\n   ```json\n   {\n       \"product_name\": \"Smartphone\",\n       \"category\": \"Electronics\",\n       \"specification\": \"64GB storage, 6GB RAM\",\n       \"price\": \"$299.99\"\n   }\n   ```\n\n**Notes:**\n- Ensure all required fields are present and properly formatted.\n- The `price` field should accommodate various currency symbols and formats."
        }
    }
}

