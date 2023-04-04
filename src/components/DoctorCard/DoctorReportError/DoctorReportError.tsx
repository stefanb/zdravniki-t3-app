import { zodResolver } from '@hookform/resolvers/zod';
import type { CustomTypeOptions } from 'i18next';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

type ReportErrorTranslations =
  CustomTypeOptions['resources']['dr-report-error'];

const ADDRESS_LENGTH_LIMIT = 255;
const NOTE_LENGTH_LIMIT = 255;

import {
  EmailSvg,
  LinkSvg,
  MapMarkerSvg,
  PhoneSvg,
} from '@/components/Shared/Icons';
import { Input } from '@/components/Shared/Inputs/Input';
import SelectBase from '@/components/Shared/Selects/SelectBase/SelectBase';
import { api } from '@/lib/utils/api';
import type { Doctor, SendReportInput } from '@/server/api/routers/doctors';

import styles from './DoctorReportError.module.css';
import DoctorReportErrorActions from './DoctorReportErrorActions';

const formDataSchema = z.object({
  address: z.string().max(ADDRESS_LENGTH_LIMIT),
  websites: z
    .array(
      z.object({
        website: z.string(),
      })
    )
    .nonempty(),
  phones: z
    .array(
      z.object({
        phone: z.string(),
      })
    )
    .nonempty(),
  email: z.string(),
  orderform: z.string(),
  accepts: z.enum(['y', 'n']),
  availability: z.string(),
  note: z.string().max(NOTE_LENGTH_LIMIT),
});

type FormData = z.infer<typeof formDataSchema>;

type DoctorReportErrorProps = {
  address: Doctor['location']['address']['fullAddress'];
  websites: Doctor['websites'];
  phones: Doctor['phones'];
  email: Doctor['email'];
  orderform: Doctor['orderform'];
  accepts: Doctor['accepts'];
  availability: Doctor['availability'];
  note: Doctor['override']['note'];
  onEditDone: () => void;
};

const DoctorReportError = ({
  onEditDone,
  ...props
}: DoctorReportErrorProps) => {
  const { t } = useTranslation('common');
  const { t: tReportError } = useTranslation('dr-report-error');
  const buttonTranslations: ReportErrorTranslations['buttons'] = tReportError(
    'buttons',
    { returnObjects: true }
  );
  const groupTranslations: ReportErrorTranslations['groups'] = tReportError(
    'groups',
    { returnObjects: true }
  );
  const inputTranslations: ReportErrorTranslations['inputs'] = tReportError(
    'inputs',
    { returnObjects: true }
  );

  const noteRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const [noteLength, setNoteLength] = useState<number>(
    noteRef.current?.value.length ?? 0
  );

  const sendReport = api.doctors.sendReport.useMutation();

  const {
    register,
    reset,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      ...props,
      websites: props.websites.map(website => ({ website })),
      phones: props.phones.map(phone => ({ phone })),
      availability: props.availability.toString(),
    },
    resolver: zodResolver(formDataSchema),
    mode: 'onChange',
  });

  const { ref: reactHookNoteRef, ...noteProps } = register('note');

  const { isSuccess } = sendReport;
  useEffect(() => {
    if (isSuccess) {
      onEditDone();
    }
  }, [isSuccess, onEditDone]);

  useEffect(() => {
    const textArea = noteRef.current;
    if (!textArea) return;
    const setHeight = () => {
      textArea.style.height = 'auto';
      textArea.style.height = `${textArea.scrollHeight}px`;
      setNoteLength(textArea.value.length);
    };
    textArea.addEventListener('input', setHeight);

    return () => {
      textArea.removeEventListener('input', setHeight);
    };
  }, []);

  const websiteFields = useFieldArray({
    control,
    name: 'websites',
  });

  const phoneFields = useFieldArray({
    control,
    name: 'phones',
  });

  const onSubmit = handleSubmit((data, e) => {
    if (!e) return;
    e.preventDefault();
    const website = data.websites.map(({ website }) => website).join(',');
    const phone = data.phones.map(({ phone }) => phone).join(',');
    const mutationInput = {
      accepts: data.accepts,
      address: data.address.trim(),
      availability: data.availability.trim(),
      email: data.email.trim(),
      note: data.note.trim(),
      phone: phone.trim(),
      orderform: data.orderform.trim(),
      website: website.trim(),
    } satisfies SendReportInput;

    sendReport.mutate(mutationInput);
  });

  const actions = (
    <DoctorReportErrorActions
      onCancel={() => onEditDone()}
      onReset={() => reset()}
      onResetText={buttonTranslations.reset}
      onSubmitText={buttonTranslations.send}
      onCancelText={buttonTranslations.cancel}
    />
  );

  return (
    <form
      onSubmit={onSubmit}
      className={styles.DoctorReportError__form}
      autoComplete="off"
    >
      {actions}
      <Input
        {...register('address')}
        type="text"
        id="address"
        placeholder={inputTranslations.address.placeholder}
        icon={<MapMarkerSvg />}
        label={inputTranslations.address.placeholder}
        error={
          errors.address?.message
            ? inputTranslations.address.message
            : undefined
        }
      />

      <fieldset>
        <legend>{groupTranslations.websites}</legend>
        {websiteFields.fields.map((field, index, arr) => (
          <div key={field.id}>
            <Input
              {...register(`websites.${index}.website`)}
              type="text"
              id={field.id}
              placeholder={inputTranslations.website.placeholder}
              inputMode="url"
              icon={<LinkSvg />}
              label={`${inputTranslations.website.label} ${index + 1}`}
              error={errors.websites?.[`${index}`]?.website?.message}
            />
            <div>
              {arr.length !== 1 && (
                <button onClick={() => websiteFields.remove(index)}>-</button>
              )}
              {arr.length - 1 === index && (
                <button onClick={() => websiteFields.append({ website: '' })}>
                  +
                </button>
              )}
            </div>
          </div>
        ))}
      </fieldset>
      <fieldset>
        <legend>{groupTranslations.phones}</legend>
        {phoneFields.fields.map((field, index, arr) => (
          <div key={field.id}>
            <Input
              {...register(`phones.${index}.phone`)}
              type="text"
              id={field.id}
              placeholder={inputTranslations.phone.placeholder}
              inputMode="tel"
              icon={<PhoneSvg />}
              label={`${inputTranslations.phone.label} ${index + 1}`}
              error={errors.phones?.[`${index}`]?.phone?.message}
            />
            <div>
              {arr.length !== 1 && (
                <button onClick={() => phoneFields.remove(index)}>-</button>
              )}
              {arr.length - 1 === index && (
                <button onClick={() => phoneFields.append({ phone: '' })}>
                  +
                </button>
              )}
            </div>
          </div>
        ))}
      </fieldset>
      <Input
        {...register('email')}
        type="text"
        id="email"
        placeholder={inputTranslations.email.placeholder}
        inputMode="email"
        icon={<EmailSvg />}
        label={inputTranslations.email.label}
        error={errors.email?.message}
      />
      <Input
        {...register('orderform')}
        type="text"
        id="orderform"
        placeholder={inputTranslations.orderform.placeholder}
        icon={<LinkSvg />}
        label={inputTranslations.orderform.label}
        error={errors.orderform?.message}
      />
      <div>
        <div>
          <label htmlFor="accepts">{inputTranslations.accepts.label}</label>
          <Controller
            name="accepts"
            control={control}
            render={({ field }) => (
              <SelectBase
                {...field}
                options={[
                  { value: 'y', label: 'Yes' },
                  { value: 'n', label: 'No' },
                ]}
                id="accepts"
              />
            )}
          />
          <label htmlFor="accepts">{errors.accepts?.message}</label>
        </div>
        <Input
          {...register('availability')}
          inputMode="decimal"
          id="availability"
          placeholder="0.0"
          label={inputTranslations.availability.label}
          error={errors.availability?.message}
        />
      </div>

      <Input
        as="textarea"
        {...noteProps}
        ref={e => {
          reactHookNoteRef(e);
          noteRef.current = e;
        }}
        id="note"
        label={inputTranslations.note.label}
        placeholder={inputTranslations.note.placeholder}
        error={
          errors.note?.message ? inputTranslations.note.message : undefined
        }
        description={`${inputTranslations.note.description} (max: ${t(
          'chars.charsWithCount',
          { count: NOTE_LENGTH_LIMIT }
        )})`}
        data-limit-remain={NOTE_LENGTH_LIMIT - noteLength}
      />
      {actions}
    </form>
  );
};

export default DoctorReportError;
