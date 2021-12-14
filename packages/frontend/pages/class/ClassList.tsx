import * as React from 'react';
import ClassCard from 'components/ClassCard';

type Post = {
  id: string;
  subject: string;
  description: string;
};

export interface ClassListProps {
  classes: Post[];
}

export default function ClassList({ classes }: ClassListProps) {
  return (
    <div className="mt-4">
      <div className="row row-cols-3 g-5">
        {classes.map((classroom) => (
          <ClassCard
            key={classroom.id}
            id={classroom.id}
            subject={classroom.subject}
            description={classroom.description}
          />
        ))}
      </div>
    </div>
  );
}
