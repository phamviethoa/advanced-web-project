import { AssignemtDto } from 'types/assignment.dto';
import { ClassroomDto } from 'types/classroom.dto';
import { StudentDto } from 'types/student.dto';
import { Table, Tag, Space } from 'antd';
import 'antd/dist/antd.css';

type Props = {
  classroom: ClassroomDto;
  student: StudentDto;
};

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Point',
    dataIndex: 'point',
    key: 'point',
    render: (point: number, record: any) => (
      <span>{`${point || '_'} / ${record.maxPoint}`}</span>
    ),
  },
  {
    title: 'Action',
    key: 'action',
    render: (text: any, record: any) => {
      if (record.name !== 'Overall' && record.isFinalized === true) {
        return (
          <Space size="middle">
            <button>request</button>
          </Space>
        );
      }
    },
  },
];

const flatten = (studentId: string, assignments: AssignemtDto[]) => {
  const filteredAssignments: AssignemtDto[] = assignments.map((assignment) => ({
    id: assignment.id,
    name: assignment.name,
    maxPoint: assignment.maxPoint,
    grades: assignment.grades.filter((grade) => grade.student.id === studentId),
    isFinalized: assignment.isFinalized,
  }));

  return filteredAssignments.map((assignment) => {
    if (assignment.grades[0]) {
      return assignment.grades[0].point;
    }

    return null;
  });
};

type DataTable = {
  name: string;
  point: number | null;
  maxPoint: number;
  isFinalized?: boolean;
}[];

const ClassroomStudentGrade = ({ classroom, student }: Props) => {
  const assignments: AssignemtDto[] = classroom.assignments;

  let data: DataTable = assignments.map((assignment, index) => {
    const grades = flatten(student.id as string, assignments);
    return {
      name: assignment.name,
      point: grades[index],
      maxPoint: assignment.maxPoint,
      isFinalized: assignment.isFinalized,
    };
  });

  const overall = {
    name: 'Overall',
    point: data.reduce((sum, current) => {
      if (current.point) {
        return sum + current.point;
      }

      return sum;
    }, 0),
    maxPoint: data.reduce((sum, current) => sum + current.maxPoint, 0),
  };

  data.push(overall);

  return (
    <div>
      <div className="d-flex justify-content-between">
        <div className="d-flex align-items-center">
          <h2 className="text-primary me-4">Grade</h2>
          <i className="fas fa-info-circle text-muted"></i>
        </div>
      </div>
      <div>
        <Table columns={columns} dataSource={data} />
      </div>
    </div>
  );
};

export default ClassroomStudentGrade;
