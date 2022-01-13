import { ClassroomDto } from 'types/classroom.dto';
import { Typography } from 'antd';
const { Title, Paragraph } = Typography;

type Props = {
  classroom: ClassroomDto;
};

const ClassroomNews = ({ classroom }: Props) => {
  return (
    <div>
      <div className="row">
        <div className="bg-primary p-5 rounded shadow-sm text-white mb-3">
          <h2 className="h2">{classroom.subject}</h2>
          <p>{classroom.description}</p>
        </div>
      </div>
      <div className="row">
        <div className="col-3 rounded shadow-sm bg-white p-4 me-3">
          <Title level={4}>Class Code</Title>
          <div>
            <Paragraph copyable>{classroom.code}</Paragraph>
          </div>
        </div>
        <div className="col rounded shadow-sm bg-white p-4"></div>
      </div>
    </div>
  );
};

export default ClassroomNews;
