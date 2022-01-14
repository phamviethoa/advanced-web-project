const notificationTemplate = {
  requestGradeReview: (studentName: string, classroomSubject: string) => {
    return `Student ${studentName} has just requested a grade review in ${classroomSubject} classroom.`;
  },
};

export default notificationTemplate;
