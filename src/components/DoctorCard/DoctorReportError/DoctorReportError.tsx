import { zodResolver } from '@hookform/resolvers/zod';
import { clsx } from 'clsx';
import { useTranslation } from 'next-i18next';
import { useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import { Chip } from '@/components/Shared/Chip';
import {
  EmailSvg,
  LinkSvg,
  MapMarkerSvg,
  PhoneSvg,
} from '@/components/Shared/Icons';
import { Input } from '@/components/Shared/Inputs/Input';
import { Select } from '@/components/Shared/Selects/Select';
import type {
  SendReportInputFromUser,
  SendReportInputUserNotNull,
} from '@/server/api/routers/doctors';

import { AddRemoveField } from './AddRemoveField';
import styles from './DoctorReportError.module.css';
import DoctorReportErrorActions from './DoctorReportErrorActions';
import DoctorReportErrorReadOnlyForm from './DoctorReportErrorReadOnlyForm';
import type { DoctorReportErrorProps, FormData } from './types';
import {
  ADDRESS_LENGTH_LIMIT,
  NOTE_LENGTH_LIMIT,
  formDataSchema,
} from './types';
import useDoctorReportErrorTranslations from './useDoctorReportErrorTranslations';
import useInputHeight from './useInputHeight';
import { getMutationInput } from './utils';

const CHARS_COUNT_TRANSLATION_KEY = 'chars.charsWithCount' as const;

const DoctorReportError = ({ onEditDone, data }: DoctorReportErrorProps) => {
  // translations
  const { t } = useTranslation('common');
  const {
    yes,
    no,
    buttons: buttonTranslations,
    groups: groupTranslations,
    inputs: inputTranslations,
  } = useDoctorReportErrorTranslations();

  // ref and state
  const noteRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const [noteLength, setNoteLength] = useState<number>(
    noteRef.current?.value.length ?? 0
  );
  const [dataToSend, setDataToSend] =
    useState<SendReportInputUserNotNull | null>(null);

  // react-hook-form
  const {
    register,
    reset,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      ...data.fromUser,
      websites: data.fromUser.websites.map(website => ({ website })),
      phones: data.fromUser.phones.map(phone => ({ phone })),
    },
    resolver: zodResolver(formDataSchema),
    mode: 'onChange',
  });
  const { ref: reactHookNoteRef, ...noteProps } = register('note');
  const websiteFields = useFieldArray({
    control,
    name: 'websites',
  });
  const phoneFields = useFieldArray({
    control,
    name: 'phones',
  });

  // adjust note height
  useInputHeight(noteRef.current);

  const onSubmit = handleSubmit((formData, e) => {
    if (!e) return;
    e.preventDefault();

    const mutationInput = getMutationInput(formData);
    const initialValues = getMutationInput({
      ...data.fromUser,
      phones: [
        ...data.fromUser.phones.map(phone => ({ phone })),
      ] as FormData['phones'],
      websites: [
        ...data.fromUser.websites.map(website => ({
          website,
        })),
      ] as FormData['websites'],
    });

    const isDifference = Object.entries(mutationInput).some(
      ([key, value]) =>
        value !== initialValues[key as keyof SendReportInputFromUser]
    );

    if (!isDifference) {
      // todo notify user that there is no difference
      return;
    }

    setDataToSend(mutationInput);
  });

  const actions = (
    <DoctorReportErrorActions
      formStatus="initial"
      onCancel={() => onEditDone()}
      onReset={() => reset()}
      onResetText={buttonTranslations.reset}
      onSubmitText={buttonTranslations.send}
      onCancelText={buttonTranslations.cancel}
    />
  );

  const formStyles = clsx(
    styles.DoctorReportError__form,
    !dataToSend && styles.Show,
    dataToSend && styles.HideForm
  );

  return (
    <>
      {!dataToSend && (
        <form onSubmit={onSubmit} className={formStyles} autoComplete="off">
          <Input
            {...register('address')}
            type="text"
            id="address"
            placeholder={inputTranslations.address.placeholder}
            icon={<MapMarkerSvg />}
            label={inputTranslations.address.placeholder}
            error={
              errors.address?.message
                ? `${inputTranslations.address.message} (max: ${t(
                    CHARS_COUNT_TRANSLATION_KEY,
                    { count: ADDRESS_LENGTH_LIMIT }
                  )})`
                : undefined
            }
            description={`(max: ${t(CHARS_COUNT_TRANSLATION_KEY, {
              count: ADDRESS_LENGTH_LIMIT,
            })})`}
          />

          <fieldset
            className={clsx(
              styles.FormGroup__fieldset,
              styles.FormGroup__full_width
            )}
          >
            <legend className={styles.FormGroup__legend}>
              <Chip
                size="sm"
                iconName="LinkSvg"
                text={groupTranslations.websites}
                className={styles.FormGroup__chip}
              />
            </legend>
            {websiteFields.fields.map((field, index, arr) => (
              <div
                key={field.id}
                className={clsx(
                  styles.FormGroup__field,
                  styles.FormGroup__full_width
                )}
              >
                <Input
                  {...register(`websites.${index}.website`)}
                  type="text"
                  id={field.id}
                  placeholder={inputTranslations.website.placeholder}
                  inputMode="url"
                  icon={<LinkSvg />}
                  label={`${inputTranslations.website.label} ${index + 1}`}
                  error={
                    errors.websites?.[`${index}`]?.website?.message
                      ? inputTranslations.website.message
                      : undefined
                  }
                />
                <AddRemoveField
                  label="website"
                  hasRemove={arr.length !== 1}
                  hasAdd={arr.length - 1 === index}
                  onRemove={() => websiteFields.remove(index)}
                  onAdd={() => websiteFields.append({ website: '' })}
                />
              </div>
            ))}
          </fieldset>
          <fieldset className={styles.FormGroup__fieldset}>
            <legend className={styles.FormGroup__legend}>
              <Chip
                size="sm"
                iconName="PhoneSvg"
                text={groupTranslations.phones}
                className={styles.FormGroup__chip}
              />
            </legend>
            {phoneFields.fields.map((field, index, arr) => (
              <div key={field.id} className={clsx(styles.FormGroup__field)}>
                <Input
                  {...register(`phones.${index}.phone`)}
                  type="text"
                  id={field.id}
                  placeholder={inputTranslations.phone.placeholder}
                  inputMode="tel"
                  icon={<PhoneSvg />}
                  label={`${inputTranslations.phone.label} ${index + 1}`}
                  error={
                    errors.phones?.[`${index}`]?.phone?.message
                      ? inputTranslations.phone.message
                      : undefined
                  }
                />
                <AddRemoveField
                  label="phone"
                  hasRemove={arr.length !== 1}
                  hasAdd={arr.length - 1 === index}
                  onRemove={() => phoneFields.remove(index)}
                  onAdd={() => phoneFields.append({ phone: '' })}
                />
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
            error={
              errors.email?.message
                ? inputTranslations.email.message
                : undefined
            }
          />
          <Input
            {...register('orderform')}
            type="text"
            id="orderform"
            placeholder={inputTranslations.orderform.placeholder}
            icon={<LinkSvg />}
            label={inputTranslations.orderform.label}
            error={
              errors.orderform?.message
                ? inputTranslations.orderform.message
                : undefined
            }
          />
          <div className={styles.FormGroup__accepts_and_availability}>
            <Controller
              name="accepts"
              control={control}
              render={({ field }) => (
                <Select
                  label={inputTranslations.accepts.label}
                  error={errors.accepts?.message}
                  {...field}
                  options={[
                    { value: 'y', label: yes, valueToShow: yes },
                    { value: 'n', label: no, valueToShow: no },
                  ]}
                  id="accepts"
                />
              )}
            />
          </div>

          <Input
            as="textarea"
            {...noteProps}
            ref={e => {
              reactHookNoteRef(e);
              noteRef.current = e;
            }}
            onChange={e => setNoteLength(e.target.value.length)}
            id="note"
            label={inputTranslations.note.label}
            placeholder={inputTranslations.note.placeholder}
            error={
              errors.note?.message
                ? `${inputTranslations.note.message} (max: ${t(
                    CHARS_COUNT_TRANSLATION_KEY,
                    { count: NOTE_LENGTH_LIMIT }
                  )})`
                : undefined
            }
            description={`${inputTranslations.note.description} (max: ${t(
              CHARS_COUNT_TRANSLATION_KEY,
              { count: NOTE_LENGTH_LIMIT }
            )})`}
            data-limit-remain={NOTE_LENGTH_LIMIT - noteLength}
          />
          {actions}
        </form>
      )}
      {dataToSend && (
        <DoctorReportErrorReadOnlyForm
          data={dataToSend}
          initialData={{
            address: data.fromUser.address,
            accepts: data.fromUser.accepts,
            email: data.fromUser.email,
            note: data.fromUser.note,
            orderform: data.fromUser.orderform,
            phone: data.fromUser.phones.join(', '),
            website: data.fromUser.websites.join(', '),
          }}
          fixed={data.fixed}
          back={() => setDataToSend(null)}
          onEditDone={onEditDone}
        />
      )}
    </>
  );
};

export default DoctorReportError;
