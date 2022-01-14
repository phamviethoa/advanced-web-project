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
  defaultValue?: string;
};

const Input = ({
  type = InputType.TEXT,
  category = InputCategory.INPUT,
  name,
  label,
  defaultValue,
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
            defaultValue={defaultValue}
            className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
            {...register(name)}
          />
          <div className="invalid-feedback">{errors[name]?.message}</div>
        </>
      ) : (
        <>
          <textarea
            className={`form-control ${errors[name] ? 'is-invalid' : ''}`}
            {...register(name)}
          ></textarea>
          <div className="invalid-feedback">{errors[name]?.message}</div>
        </>
      )}
    </div>
  );
};

export default Input;
