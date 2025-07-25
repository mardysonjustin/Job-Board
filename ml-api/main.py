from fastapi import FastAPI, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer, util
import pdfplumber

app = FastAPI()

KNOWN_SKILLS = [
    "Python", "JavaScript", "Node.js", "React", "Django", "Flask",
    "FastAPI", "Git", "SQL", "NoSQL", "MongoDB", "PostgreSQL",
    "REST", "RESTful API", "Machine Learning", "Deep Learning",
    "TensorFlow", "PyTorch", "Pandas", "NumPy", "Docker", "Kubernetes",
    "AWS", "GCP", "Azure", "CI/CD", "HTML", "CSS", "Tailwind", "Express"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

model = SentenceTransformer('all-MiniLM-L6-v2') 

def extract_text_from_pdf(upload_file: UploadFile) -> str:
    with pdfplumber.open(upload_file.file) as pdf:
        text = "\n".join([page.extract_text() or '' for page in pdf.pages])
    return text.strip()

def extract_skills(text: str, skill_list: list) -> list:
    found = []
    for skill in skill_list:
        if skill.lower() in text.lower():
            found.append(skill)
    return found


@app.post("/match")
async def match_resume(resume: UploadFile, job_description: str = Form(...)):
    try:
        resume_text = extract_text_from_pdf(resume)

        # compute sentence embeddings
        emb_resume = model.encode(resume_text, convert_to_tensor=True)
        emb_job = model.encode(job_description, convert_to_tensor=True)

        # compute cosine similarity
        similarity = util.cos_sim(emb_resume, emb_job).item()
        score = round(similarity * 100)

        skills = ['Python', 'JavaScript', 'React', 'Node.js', 'Django', 'SQL', 'HTML', 'CSS', 'FastAPI']

        resume_lower = resume_text.lower()
        job_desc_lower = job_description.lower()

        matched_skills = [skill for skill in skills if skill.lower() in resume_lower and skill.lower() in job_desc_lower]
        missing_skills = [skill for skill in skills if skill.lower() in job_desc_lower and skill not in matched_skills]

        return {
            "score": score,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills
        }

    except Exception as e:
        return {"error": str(e)}

