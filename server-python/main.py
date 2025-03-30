from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import pdfkit
import os

# Configure pdfkit with the path to wkhtmltopdf
config = pdfkit.configuration(wkhtmltopdf=r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe")

app = FastAPI()

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define Pydantic Model for input validation
class HTMLInput(BaseModel):
    html_content: str

@app.post("/generate-pdf/")
async def generate_pdf(data: HTMLInput):
    try:
        html_file = "temp.html"
        pdf_file = "output.pdf"

        # Save HTML to a file
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(data.html_content)

        # Generate PDF from the HTML file
        pdfkit.from_file(html_file, pdf_file, configuration=config)

        # Check if PDF was created successfully
        if not os.path.exists(pdf_file):
            raise HTTPException(status_code=500, detail="PDF generation failed.")

        # Return PDF as response
        return FileResponse(pdf_file, media_type="application/pdf", filename="generated.pdf")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
