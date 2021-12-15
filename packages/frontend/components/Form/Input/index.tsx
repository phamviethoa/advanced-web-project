import { useFormContext } from 'react-hook-form';

export enum InputType {
  TEXT = 'text',
  NUMBER = 'number',
  PASSWORD = 'password',
}

export enum InputCategory {
  INPUT = 'input',
  TEXTAREA = 'textarea',
}

type Props = {
  type?: InputType;
  category?: InputCategory;
  name: string;
  label: string;
};

const Input = ({
  type = InputType.TEXT,
  category = InputCategory.INPUT,
  name,
  label,
}: Props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="mb-3">
      <label htmlFor="formGroupExampleInput" className="form-label">
        {label}
      </label>
      {category === InputCategory.INPUT ? (
        <>
          <input
            type={type}
            className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
            {...register('subject')}
          />
          <div className="invalid-feedback">{errors[name]?.message}</div>
        </>
      ) : (
        <>
          <textarea
            className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
            {...register('description')}
          ></textarea>
          <div className="invalid-feedback">{errors[name]?.message}</div>
        </>
      )}
    </div>
  );
};

export default Input;
