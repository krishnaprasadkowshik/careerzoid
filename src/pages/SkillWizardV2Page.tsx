import { useState } from "react";

export default function SkillWizardV2Page() {
  const [step, setStep] = useState(1);

  const [skillData, setSkillData] = useState({
    name: "",
    category: "",
    description: "",
    difficulty: "",
    learningTime: "",

    fresherSalary: "",
    twoYearSalary: "",
    fiveYearSalary: "",
    tenYearSalary: "",

    freeCourse1: "",
    freeCourse2: "",

    paidCourse1: "",
    paidCourse2: "",

    youtube1: "",
    youtube2: "",

    certificate1: "",
    certificate2: "",

    project1: "",
    project2: "",

    company1: "",
    company2: "",

    careerPath1: "",
    careerPath2: "",

    nextSkill1: "",
    nextSkill2: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSkillData({
      ...skillData,
      [e.target.name]: e.target.value,
    });
  };

  const publishSkill = () => {
    console.log(skillData);

    alert(
      "Skill Saved Successfully (Firestore coming next)"
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-5xl font-bold mb-3">
          Skill Intelligence Wizard
        </h1>

        <p className="text-gray-400 mb-10">
          CareerZoid Admin Panel
        </p>

        <div className="w-full bg-slate-800 rounded-full h-4 mb-12">

          <div
            className="bg-purple-600 h-4 rounded-full transition-all"
            style={{
              width: `${(step / 4) * 100}%`,
            }}
          />

        </div>

        {step === 1 && (
          <div className="space-y-5">

            <h2 className="text-3xl font-bold">
              Step 1 - Basic Information
            </h2>

            <input
              name="name"
              placeholder="Skill Name"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="category"
              placeholder="Category"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <textarea
              name="description"
              placeholder="Description"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 h-40"
            />

            <input
              name="difficulty"
              placeholder="Difficulty"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="learningTime"
              placeholder="Learning Time"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <button
              onClick={() => setStep(2)}
              className="bg-purple-600 px-8 py-3 rounded-xl"
            >
              Next
            </button>

          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">

            <h2 className="text-3xl font-bold">
              Step 2 - Salary Intelligence
            </h2>

            <input
              name="fresherSalary"
              placeholder="Fresher Salary"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="twoYearSalary"
              placeholder="2 Year Salary"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="fiveYearSalary"
              placeholder="5 Year Salary"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="tenYearSalary"
              placeholder="10 Year Salary"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <div className="flex gap-4">

              <button
                onClick={() => setStep(1)}
                className="bg-gray-700 px-8 py-3 rounded-xl"
              >
                Back
              </button>

              <button
                onClick={() => setStep(3)}
                className="bg-purple-600 px-8 py-3 rounded-xl"
              >
                Next
              </button>

            </div>

          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">

            <h2 className="text-3xl font-bold">
              Step 3 - Courses & Learning
            </h2>

            <input
              name="freeCourse1"
              placeholder="Free Course 1"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="freeCourse2"
              placeholder="Free Course 2"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="paidCourse1"
              placeholder="Paid Course 1"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="paidCourse2"
              placeholder="Paid Course 2"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="youtube1"
              placeholder="YouTube Playlist 1"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="youtube2"
              placeholder="YouTube Playlist 2"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <div className="flex gap-4">

              <button
                onClick={() => setStep(2)}
                className="bg-gray-700 px-8 py-3 rounded-xl"
              >
                Back
              </button>

              <button
                onClick={() => setStep(4)}
                className="bg-purple-600 px-8 py-3 rounded-xl"
              >
                Next
              </button>

            </div>

          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">

            <h2 className="text-3xl font-bold">
              Step 4 - Career Intelligence
            </h2>

            <input
              name="certificate1"
              placeholder="Certificate 1"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="certificate2"
              placeholder="Certificate 2"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="project1"
              placeholder="Project 1"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="project2"
              placeholder="Project 2"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="company1"
              placeholder="Company Hiring 1"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="company2"
              placeholder="Company Hiring 2"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="careerPath1"
              placeholder="Career Path 1"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="careerPath2"
              placeholder="Career Path 2"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="nextSkill1"
              placeholder="Next Skill 1"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <input
              name="nextSkill2"
              placeholder="Next Skill 2"
              onChange={handleChange}
              className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700"
            />

            <div className="flex gap-4">

              <button
                onClick={() => setStep(3)}
                className="bg-gray-700 px-8 py-3 rounded-xl"
              >
                Back
              </button>

              <button
                onClick={publishSkill}
                className="bg-green-600 px-8 py-3 rounded-xl"
              >
                Publish Skill
              </button>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}