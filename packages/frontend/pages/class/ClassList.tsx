import * as React from 'react';
import ClassCard from 'components/ClassCard';
import { ClassroomDto } from 'types/classroom.dto';

export interface ClassListProps {
  classes?: ClassroomDto[];
}

export default function ClassList({ classes }: ClassListProps) {
  return (
    <div className="mt-4">
      <div className="row row-cols-3 g-5">
        {classes?.map((classroom) => (
          <ClassCard
            key={classroom.id}
            id={classroom.id as string}
            subject={classroom.subject}
            description={classroom.description}
          />
        ))}
      </div>
    </div>
  );
}
