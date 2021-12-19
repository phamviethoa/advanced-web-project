import { Table, Column, HeaderCell, Cell } from 'rsuite-table';
import { AssignemtDto } from 'types/assignment.dto';
import 'rsuite-table/dist/css/rsuite-table.css';
import { useForm } from 'react-hook-form';
import { StudentDto } from 'types/student.dto';
import { ClassroomDto } from 'types/classroom.dto';
import styles from 'components/Class/ClassroomGrade/index.module.css';
import InlineEdit from '@atlaskit/inline-edit';
import { toast } from 'react-toastify';
import { Dropdown, Popover, Whisper } from 'rsuite';
import { SyntheticEvent } from 'react';

const assignments: AssignemtDto[] = [
  {
    id: '1',
    name: 'Giua ky',
    maxPoint: 30,
    grades: [
      {
        point: 20,
        student: {
          id: '1',
          identity: '1',
          fullName: 'Hoa Pham 1',
        },
      },
      {
        point: 30,
        student: {
          id: '2',
          identity: '2',
          fullName: 'Hoa Pham 2',
        },
      },
      {
        point: 40,
        student: {
          id: '3',
          identity: '3',
          fullName: 'Hoa Pham 3',
        },
      },
    ],
  },
  {
    id: '2',
    name: 'Cuoi ky',
    maxPoint: 70,
    grades: [
      {
        point: 40,
        student: {
          id: '1',
          identity: '1',
          fullName: 'Hoa Pham 1',
        },
      },
      {
        point: 50,
        student: {
          id: '2',
          identity: '2',
          fullName: 'Hoa Pham 2',
        },
      },
      {
        point: 60,
        student: {
          id: '3',
          identity: '3',
          fullName: 'Hoa Pham 3',
        },
      },
    ],
  },
];

const students: StudentDto[] = [
  {
    id: '1',
    identity: '1',
    fullName: 'Hoa Pham 1',
  },
  {
    id: '2',
    identity: '2',
    fullName: 'Hoa Pham 2',
  },
  {
    id: '3',
    identity: '3',
    fullName: 'Hoa Pham 3',
  },
];

const classroom: ClassroomDto = {
  id: '1',
  subject: 'example class',
  description: 'example description',
  teachers: [],
  students,
  assignments,
};

type GradeBoardData = {
  id: string;
  identity: string;
  fullName: string;
  grades: number[];
}[];

const flatten = (studentId: string, assignments: AssignemtDto[]) => {
  const filteredAssignments: AssignemtDto[] = assignments.map((assignment) => ({
    id: assignment.id,
    name: assignment.name,
    maxPoint: assignment.maxPoint,
    grades: assignment.grades.filter((grade) => grade.student.id === studentId),
  }));

  return filteredAssignments.map((assignment) => assignment.grades[0].point);
};

const dataList: GradeBoardData = students.map(({ identity, id, fullName }) => ({
  id: id as string,
  identity,
  fullName,
  grades: flatten(id as string, assignments),
}));

type FormFields = {
  assignments: AssignemtDto[];
};

enum SelectOptionKey {
  DOWNLOAD_GRADE = 'DOWNLOAD_GRADE',
  UPLOAD_GRADE = 'UPLOAD_GRADE',
  MARK_GRADE_FINALIZED = 'MARK_GRADE_FINALIZED',
}

const ClassroomGrade = () => {
  const downloadStudentListTemplate = () => {};
  const uploadStudentList = () => {};

  const { handleSubmit, register } = useForm<FormFields>({
    defaultValues: {
      assignments,
    },
  });

  const updateGrade = handleSubmit(async (data: FormFields) => {
    console.log('Data: ', data);
  });

  const downloadAssignmentGradeTemplate = (assignmentId: string) => {
    console.log(
      `downloading grade template for assignment ${assignmentId} ...`
    );
  };

  const uploadAssignmentGrade = (assignmentId: string) => {
    console.log(`uploading grade for assignment ${assignmentId} ...`);
  };

  const markAssignmentAsFinalized = (assignmentId: string) => {
    console.log(`marked grade for assignment ${assignmentId} as finalized`);
  };

  const triggerHandleSelectAssignmentOptions = () => ({
    [SelectOptionKey.DOWNLOAD_GRADE]: downloadAssignmentGradeTemplate,
    [SelectOptionKey.UPLOAD_GRADE]: uploadAssignmentGrade,
    [SelectOptionKey.MARK_GRADE_FINALIZED]: markAssignmentAsFinalized,
  });

  const handleSelectAssignmentOptions =
    (assignmentId: string) =>
    (eventKey: string | undefined, event: SyntheticEvent) => {
      event.stopPropagation();
      triggerHandleSelectAssignmentOptions()[eventKey as SelectOptionKey](
        assignmentId
      );
    };

  return (
    <div>
      <div className="d-flex justify-content-between">
        <h2 className="text-primary">Grade</h2>
        <div>
          <span className="text-muted me-4">
            <a onClick={downloadStudentListTemplate} className="fw-normal">
              <i
                style={{ fontSize: '0.8rem' }}
                className="fas fa-arrow-circle-down me-2"
              ></i>
              Download template
            </a>
          </span>
          <span className="text-muted">
            <a onClick={uploadStudentList} className="fw-normal">
              <i
                style={{ fontSize: '0.8rem' }}
                className="fas fa-arrow-circle-up me-2"
              ></i>
              Upload template
            </a>
          </span>
        </div>
      </div>

      <div className="mt-5 bg-white">
        <form noValidate onSubmit={updateGrade}>
          <Table data={dataList} autoHeight={true} bordered={true}>
            <Column width={70} align="center" fixed>
              <HeaderCell>Identity</HeaderCell>
              <Cell dataKey="identity" />
            </Column>

            <Column width={200} fixed>
              <HeaderCell>Full Name</HeaderCell>
              <Cell dataKey="fullName" />
            </Column>

            {assignments.map((assignment, order) => (
              <Column width={150} fixed align="center" key={assignment.id}>
                <HeaderCell>
                  <div className="d-flex align-items-center justify-content-end me-2">
                    <div>{assignment.name}</div>
                    <Whisper
                      placement="autoVerticalStart"
                      trigger="click"
                      speaker={
                        <Popover>
                          <Dropdown.Menu
                            onSelect={handleSelectAssignmentOptions(
                              assignment.id as string
                            )}
                          >
                            <Dropdown.Item
                              eventKey={SelectOptionKey.DOWNLOAD_GRADE}
                            >
                              Download template
                            </Dropdown.Item>
                            <Dropdown.Item
                              eventKey={SelectOptionKey.UPLOAD_GRADE}
                            >
                              Upload template
                            </Dropdown.Item>
                            <Dropdown.Item
                              eventKey={SelectOptionKey.MARK_GRADE_FINALIZED}
                            >
                              Mark as finalized
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Popover>
                      }
                    >
                      <i className="fas fa-ellipsis-v text-muted ms-3"></i>
                    </Whisper>
                  </div>
                </HeaderCell>
                <Cell>
                  {({ grades }, index) => (
                    <InlineEdit
                      defaultValue={grades[order]}
                      editView={() => (
                        <div className="d-flex align-items-center justify-content-end me-2">
                          <div
                            style={{ width: '65px' }}
                            className="border-bottom border-primary"
                          >
                            <input
                              style={{ width: '40px' }}
                              className={`${styles.gradeInput}`}
                              type="text"
                              {...register(
                                `assignments.${order}.grades.${index}.point` as const
                              )}
                            />
                            <span className="text-muted">{`/${assignment.maxPoint}`}</span>
                          </div>
                          <i className="fas fa-ellipsis-v text-muted ms-3"></i>
                        </div>
                      )}
                      readView={() => <span>{grades[order]}</span>}
                      onConfirm={() => {
                        toast.success('Submit!');
                      }}
                    />
                  )}
                </Cell>
              </Column>
            ))}
          </Table>
        </form>
      </div>
    </div>
  );
};

export default ClassroomGrade;
