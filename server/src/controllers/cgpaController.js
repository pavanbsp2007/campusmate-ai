const { v4: uuidv4 } = require('uuid');
const db = require('../db');

// Standard university grading scale mappings
const DEFAULT_GRADE_SCALES = {
  '10_point_standard': [
    { letter: 'O', points: 10.0, description: 'Outstanding' },
    { letter: 'A+', points: 9.5, description: 'Excellent' },
    { letter: 'A', points: 9.0, description: 'Very Good' },
    { letter: 'B+', points: 8.0, description: 'Good' },
    { letter: 'B', points: 7.0, description: 'Above Average' },
    { letter: 'C', points: 6.0, description: 'Average' },
    { letter: 'P', points: 5.0, description: 'Pass' },
    { letter: 'F', points: 0.0, description: 'Fail' }
  ],
  '4_point_us': [
    { letter: 'A', points: 4.0, description: 'Excellent' },
    { letter: 'A-', points: 3.7, description: 'Very Good' },
    { letter: 'B+', points: 3.3, description: 'Good' },
    { letter: 'B', points: 3.0, description: 'Above Average' },
    { letter: 'B-', points: 2.7, description: 'Average' },
    { letter: 'C+', points: 2.3, description: 'Below Average' },
    { letter: 'C', points: 2.0, description: 'Poor' },
    { letter: 'F', points: 0.0, description: 'Fail' }
  ]
};

exports.getGradesAndCGPA = async (req, res) => {
  try {
    const userId = req.user.id;
    const grades = await db.query(
      `SELECT * FROM semester_grades WHERE user_id = ? ORDER BY semester ASC, created_at ASC`,
      [userId]
    );

    // Group by semester
    const semesterMap = {};
    let totalCumulativePoints = 0;
    let totalCumulativeCredits = 0;

    grades.forEach((item) => {
      const sem = item.semester;
      if (!semesterMap[sem]) {
        semesterMap[sem] = {
          semester: sem,
          subjects: [],
          totalPoints: 0,
          totalCredits: 0,
          sgpa: 0
        };
      }

      const points = Number(item.grade_points);
      const credits = Number(item.credits);

      semesterMap[sem].subjects.push(item);
      semesterMap[sem].totalPoints += points * credits;
      semesterMap[sem].totalCredits += credits;

      totalCumulativePoints += points * credits;
      totalCumulativeCredits += credits;
    });

    const semesters = Object.values(semesterMap).map((sem) => ({
      ...sem,
      sgpa: sem.totalCredits > 0 ? Math.round((sem.totalPoints / sem.totalCredits) * 100) / 100 : 0
    }));

    const cgpa =
      totalCumulativeCredits > 0
        ? Math.round((totalCumulativePoints / totalCumulativeCredits) * 100) / 100
        : 0;

    return res.json({
      success: true,
      data: {
        semesters,
        cgpa,
        totalCumulativeCredits,
        totalCumulativePoints,
        gradeScales: DEFAULT_GRADE_SCALES
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch grades.', error: error.message });
  }
};

exports.addGrade = async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester, subjectName, credits, gradeLetter, gradePoints } = req.body;

    if (!semester || !subjectName || !credits || gradePoints === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required course grade fields.' });
    }

    const id = 'sg_' + uuidv4().substring(0, 8);
    await db.query(
      `INSERT INTO semester_grades (id, user_id, semester, subject_name, credits, grade_letter, grade_points)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, Number(semester), subjectName.trim(), Number(credits), gradeLetter || 'A', Number(gradePoints)]
    );

    return res.status(201).json({ success: true, message: 'Grade saved successfully!', id });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add grade.', error: error.message });
  }
};

exports.deleteGrade = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await db.query('DELETE FROM semester_grades WHERE id = ? AND user_id = ?', [id, userId]);
    return res.json({ success: true, message: 'Course grade removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete grade.', error: error.message });
  }
};

exports.calculateTarget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetCGPA, futureCredits } = req.body;

    const grades = await db.query(
      `SELECT credits, grade_points FROM semester_grades WHERE user_id = ?`,
      [userId]
    );

    let currentPoints = 0;
    let currentCredits = 0;
    grades.forEach((g) => {
      currentPoints += Number(g.credits) * Number(g.grade_points);
      currentCredits += Number(g.credits);
    });

    const target = Number(targetCGPA);
    const future = Number(futureCredits) || 20;
    const totalCreditsGoal = currentCredits + future;
    const totalRequiredPoints = target * totalCreditsGoal;
    const neededPoints = totalRequiredPoints - currentPoints;
    const requiredSGPA = future > 0 ? Math.round((neededPoints / future) * 100) / 100 : 0;

    return res.json({
      success: true,
      data: {
        currentCGPA: currentCredits > 0 ? Math.round((currentPoints / currentCredits) * 100) / 100 : 0,
        currentCredits,
        futureCredits: future,
        targetCGPA: target,
        requiredSGPA,
        isAchievable: requiredSGPA <= 10.0 && requiredSGPA >= 0
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Target calculation failed.', error: error.message });
  }
};
