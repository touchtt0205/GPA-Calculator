import React, { useState, useEffect } from 'react';

interface Course {
  name: string;
  grade: string;
  credits: number;
}

interface Term {
  courses: Course[];
  totalCredits: number;
  earnedCredits: number;
}

const gradePoints: Record<string, number> = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'D-': 0.7,
  'F': 0.0,
  'W': 0.0,
};

const GradeCalculator = () => {
  const [terms, setTerms] = useState<Term[]>([]);
  const [overallGpa, setOverallGpa] = useState<number | null>(null);

  // Load saved terms from localStorage
  useEffect(() => {
    const savedTerms = localStorage.getItem('terms');
    if (savedTerms) {
      setTerms(JSON.parse(savedTerms));
    } else {
      setTerms([{ courses: Array(10).fill({ name: '', grade: 'F', credits: 0 }), totalCredits: 0, earnedCredits: 0 }]);
    }
  }, []);

  // Save terms to localStorage
  useEffect(() => {
    localStorage.setItem('terms', JSON.stringify(terms));
  }, [terms]);

  const calculateTermGPA = (term: Term) => {
    let totalCredits = 0;
    let totalGradePoints = 0;

    term.courses.forEach((course) => {
      if (course.grade !== 'W' && course.grade !== 'F' && course.credits > 0) {
        totalCredits += course.credits;
        totalGradePoints += gradePoints[course.grade] * course.credits;
      }
    });

    return totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  };

  const calculateOverallGPA = () => {
    let totalCredits = 0;
    let totalGradePoints = 0;
    let totalEarnedCredits = 0;

    terms.forEach((term) => {
      term.courses.forEach((course) => {
        if (course.grade !== 'W' && course.grade !== 'F' && course.credits > 0) {
          totalCredits += course.credits;
          totalGradePoints += gradePoints[course.grade] * course.credits;
          totalEarnedCredits += course.credits;
        }
      });
    });

    setOverallGpa(totalCredits > 0 ? totalGradePoints / totalCredits : 0);
  };

  const handleCourseChange = (termIndex: number, courseIndex: number, field: keyof Course, value: string | number) => {
    const updatedTerms = [...terms];
    updatedTerms[termIndex].courses[courseIndex] = { 
      ...updatedTerms[termIndex].courses[courseIndex], 
      [field]: value 
    };

    // Update totalCredits and earnedCredits for the term
    updatedTerms[termIndex].totalCredits = updatedTerms[termIndex].courses.reduce((total, course) => total + course.credits, 0);
    updatedTerms[termIndex].earnedCredits = updatedTerms[termIndex].courses
      .filter(course => course.grade !== 'F' && course.grade !== 'W')
      .reduce((total, course) => total + course.credits, 0);

    setTerms(updatedTerms);
  };

  const handleRemoveCourse = (termIndex: number, courseIndex: number) => {
    const updatedTerms = [...terms];
    updatedTerms[termIndex].courses.splice(courseIndex, 1);
    updatedTerms[termIndex].totalCredits = updatedTerms[termIndex].courses.reduce((total, course) => total + course.credits, 0);
    updatedTerms[termIndex].earnedCredits = updatedTerms[termIndex].courses
      .filter(course => course.grade !== 'F' && course.grade !== 'W')
      .reduce((total, course) => total + course.credits, 0);

    setTerms(updatedTerms);
  };

  const addTerm = () => {
    setTerms([...terms, { courses: Array(10).fill({ name: '', grade: 'F', credits: 0 }), totalCredits: 0, earnedCredits: 0 }]);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-indigo-600 mb-6">Grade and GPA Calculator</h1>

        {terms.map((term, termIndex) => (
          <div key={termIndex} className="mb-6 p-4 rounded-lg shadow-sm bg-gray-50">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Term {termIndex + 1}</h2>

            <div className="space-y-4">
              {term.courses.map((course, courseIndex) => (
                <div key={courseIndex} className="flex space-x-4 items-center">
                  <input
                    type="text"
                    placeholder={`Course ${courseIndex + 1}`}
                    className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    value={course.name}
                    onChange={(e) => handleCourseChange(termIndex, courseIndex, 'name', e.target.value)}
                  />
                  <select
                    className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    value={course.grade}
                    onChange={(e) => handleCourseChange(termIndex, courseIndex, 'grade', e.target.value)}
                  >
                    {Object.keys(gradePoints).map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Credits"
                    className="w-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    value={course.credits}
                    onChange={(e) => handleCourseChange(termIndex, courseIndex, 'credits', parseFloat(e.target.value))}
                  />
                  <button
                    onClick={() => handleRemoveCourse(termIndex, courseIndex)}
                    className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-lg font-semibold text-gray-600">Term GPA: <span className="text-indigo-600">{calculateTermGPA(term).toFixed(2)}</span></p>
              <p className="text-lg font-semibold text-gray-600">Total Credits: <span className="text-indigo-600">{term.totalCredits}</span></p>
              <p className="text-lg font-semibold text-gray-600">Earned Credits: <span className="text-indigo-600">{term.earnedCredits}</span></p>
            </div>
          </div>
        ))}

        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={addTerm}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
          >
            Add New Term
          </button>
          <button
            onClick={calculateOverallGPA}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Calculate Overall GPA
          </button>
        </div>

        {overallGpa !== null && (
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-800">Overall GPA: <span className="text-indigo-600">{overallGpa.toFixed(2)}</span></h2>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradeCalculator;
