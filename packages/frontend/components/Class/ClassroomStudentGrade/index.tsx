import studentService from 'api/student';
import { useQuery } from 'react-query';
import { AssignemtDto } from 'types/assignment.dto';
import { ClassroomDto } from 'types/classroom.dto';

type Props = {
  classroom: ClassroomDto;
};

const ClassroomStudentGrade = ({ classroom }: Props) => {
  const assignments: AssignemtDto[] = classroom.assignments;

  const { data: grades } = useQuery(['grades', classroom.id], () =>
    studentService.getGrades(classroom.id)
  );

  console.log('grades: ', grades);

  return (
    <div>
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center">
          <h2 className="text-primary me-4">Grade</h2>
          <i className="fas fa-info-circle text-muted"></i>
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default ClassroomStudentGrade;
