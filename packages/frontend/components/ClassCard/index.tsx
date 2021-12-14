import Link from 'next/link';

type Props = {
  id: string;
  subject: string;
  description: string;
};

const ClassCard = ({ id, subject, description }: Props) => {
  return (
    <Link href={`/class/${id}`}>
      <div className="col">
        <div className="card mb-3">
          <div className="row g-0">
            <div className="col-md-4 bg-primary"></div>
            <div style={{ height: '150px' }} className="col-md-8">
              <div className="card-body">
                <h5 className="card-title">{subject}</h5>
                <p className="card-text">{description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ClassCard;
