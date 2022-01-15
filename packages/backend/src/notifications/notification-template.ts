const notificationTemplate = {
  requestGradeReview: (classroomSubject: string) => {
    return `Grade review request in ${classroomSubject}.`;
  },

  finalizeAGradeComposition: (
    assignmentName: string,
    classroomSubject: string,
  ) => {
    return `Grade composition ${assignmentName} has been finalized in ${classroomSubject}.`;
  },

  replyForStudentReview: (assignmentName: string, classroomSubject: string) => {
    return `Teacher in ${classroomSubject} has replied on your grade review in ${assignmentName}.`;
  },

  markFinalGrade: (assignmentName: string, classroomSubject: string) => {
    return `Teacher in ${classroomSubject} has close your grade review in ${assignmentName}.`;
  },
};

export default notificationTemplate;
