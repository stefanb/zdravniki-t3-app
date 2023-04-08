import { clsx } from 'clsx';
import type { CustomTypeOptions } from 'i18next';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Chip } from '@/components/Shared/Chip';
import type { IconName } from '@/components/Shared/Icons';
import { Typography } from '@/components/Shared/Typography';
import { api } from '@/lib/utils/api';
import type { Doctor, SendReportInput } from '@/server/api/routers/doctors';

import styles from './DoctorReportError.module.css';
import DoctorReportErrorActions from './DoctorReportErrorActions';

type ReportErrorTranslations =
  CustomTypeOptions['resources']['dr-report-error'];
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
type DoctorReportErrorReadOnlyFormProps = {
  data: SendReportInput | null;
  initialData: SendReportInput;
  back: () => void;
  onEditDone: DoctorReportErrorProps['onEditDone'];
};

const INPUT_ICONS_MAP = {
  address: 'MapMarkerSvg',
  email: 'EmailSvg',
  orderform: 'LinkSvg',
  note: undefined,
  website: 'LinkSvg',
  accepts: undefined,
  availability: undefined,
  phone: 'PhoneSvg',
} satisfies Record<keyof SendReportInput, IconName | undefined>;

const DoctorReportErrorReadOnlyForm = ({
  data,
  back,
  onEditDone,
  initialData,
}: DoctorReportErrorReadOnlyFormProps) => {
  const { t: tReportError } = useTranslation('dr-report-error');
  const buttonTranslations: ReportErrorTranslations['buttons'] = tReportError(
    'buttons',
    { returnObjects: true }
  );
  const inputTranslations: ReportErrorTranslations['inputs'] = tReportError(
    'inputs',
    { returnObjects: true }
  );
  const yes = tReportError('yes');
  const no = tReportError('no');

  const { register, handleSubmit } = useForm<SendReportInput>({
    defaultValues: data ?? undefined,
  });

  // mutation
  const sendReport = api.doctors.sendReport.useMutation();

  const { isSuccess } = sendReport;
  useEffect(() => {
    if (isSuccess) {
      onEditDone();
    }
  }, [isSuccess, onEditDone]);

  const onSubmit = handleSubmit((data, e) => {
    if (!e) return;
    e.preventDefault();
    sendReport.mutate(data);
  });

  const beforeSendStyles = clsx(
    styles.DoctorReportError__form,
    data && styles.Show,
    !data && styles.HideCheck
  );

  const actions = (
    <DoctorReportErrorActions
      onBack={() => back()}
      onConfirmText={buttonTranslations.confirm}
      onBackText={buttonTranslations.back}
    />
  );

  return (
    <form className={beforeSendStyles} onSubmit={onSubmit}>
      {actions}
      {data &&
        Object.entries(data).map(([label, value]) => {
          const _label = label as keyof SendReportInput;
          const iconName = INPUT_ICONS_MAP[`${_label}`];

          const _value =
            _label === 'accepts' ? (value === 'y' ? yes : no) : value;

          const initialValue = initialData[`${_label}`];
          const _initialValue =
            _label === 'accepts'
              ? initialValue === 'y'
                ? yes
                : no
              : initialValue;
          const isChanged = value !== initialValue;

          return isChanged ? (
            <>
              <div className={styles.FormGroup__values}>
                <Chip
                  size="sm"
                  iconName={iconName}
                  text={inputTranslations[`${_label}`].label}
                  className={clsx(
                    styles.FormGroup__chip,
                    isChanged && styles.Changed
                  )}
                />

                <p className={clsx(styles.Value, styles.InitialValue)}>
                  <Typography as="h6" element="strong">
                    {_initialValue ? _initialValue : '---'}
                  </Typography>
                </p>
                <p className={clsx(styles.Value, styles.ChangedValue)}>
                  <Typography as="h6" element="strong">
                    {_value ? _value : '---'}
                  </Typography>
                </p>
              </div>
              <input
                key={label}
                value={value}
                hidden
                {...register(label as keyof SendReportInput)}
              />
            </>
          ) : null;
        })}
      {actions}
    </form>
  );
};

export default DoctorReportErrorReadOnlyForm;