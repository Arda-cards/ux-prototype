/**
 * Use Case Story Framework
 *
 * A DSL-like toolkit for defining multi-step use case stories with minimal
 * boilerplate. Authors declare data, guides, scenes, and step content —
 * the framework handles all chrome, navigation, viewers, and story wiring.
 *
 * Usage:
 *   import { createUseCaseStories, useWizard, UseCaseShell, ... } from '@/use-cases/framework';
 */
import React, { useState, useEffect, useRef } from 'react';
import type { StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { ArdaButton } from '@/components/atoms/button/button';

/* ================================================================
   TYPES
   ================================================================ */

/** Description shown in guide panels for both Interactive and Stepwise modes. */
export interface GuideEntry {
  title: string;
  description: string;
  interaction: string;
}

/** A single snapshot in the Stepwise walkthrough. */
export interface Scene<T extends object> extends GuideEntry {
  wizardStep: number;
  submitted: boolean;
  formData: T;
}

/** Props injected into wizard components by the framework viewers. */
export interface WizardProps<T extends object> {
  initialStep?: number;
  initialFormData?: T;
  initialSubmitted?: boolean;
  showGuide?: boolean;
}

/** Context passed to the `play` callback in `createUseCaseStories`. */
export interface PlayContext {
  canvas: ReturnType<typeof within>;
  goToScene: (index: number) => void;
  delay: () => Promise<void>;
}

/** Configuration object for `createUseCaseStories`. */
export interface UseCaseConfig<T extends object> {
  guides: GuideEntry[];
  scenes: Scene<T>[];
  Wizard: React.ComponentType<WizardProps<T>>;
  delayMs?: number;
  play: (ctx: PlayContext) => Promise<void>;
}

/** Non-generic wizard control surface consumed by UseCaseShell. */
interface WizardControl {
  step: number;
  submitted: boolean;
  phase: number;
  stepNames: readonly string[];
  canAdvance: boolean;
  showGuide: boolean;
  handleReset: () => void;
  goToStep: (s: number) => void;
  handleSubmit: () => void;
}

/** Full wizard state returned by `useWizard`. */
export interface WizardState<T extends object> extends WizardControl {
  formData: T;
  setFormData: React.Dispatch<React.SetStateAction<T>>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

/** Per-use-case config passed to `useWizard`. */
interface WizardConfig<T extends object> {
  initial: T;
  stepNames: readonly string[];
  canAdvance: (step: number, data: T) => boolean;
}

/* ================================================================
   STYLES (exported for direct use in step content)
   ================================================================ */

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--base-border)',
  borderRadius: 8,
  fontSize: 14,
  outline: 'none',
  background: 'var(--base-background)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--base-foreground)',
  marginBottom: 4,
};

/* ================================================================
   UTILITIES
   ================================================================ */

export function formatCurrency(amount: number): string {
  return (
    '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

/* ================================================================
   COMPONENTS — Form Elements
   ================================================================ */

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  min?: string;
  step?: string;
}

export function FormField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  min,
  step,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={name} style={labelStyle}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={inputStyle}
        min={min}
        step={step}
      />
    </div>
  );
}

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[] | { value: string; label: string }[];
  placeholder?: string;
}

export function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
}: FormSelectProps) {
  return (
    <div>
      <label htmlFor={name} style={labelStyle}>
        {label}
      </label>
      <select id={name} name={name} value={value} onChange={onChange} style={inputStyle}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const v = typeof opt === 'string' ? opt : opt.value;
          const l = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
    </div>
  );
}

/** Arranges children in a side-by-side grid row. */
export function FormRow({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>{children}</div>;
}

/* ================================================================
   COMPONENTS — Summary & Review
   ================================================================ */

export function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
      <span style={{ color: 'var(--base-muted-foreground)' }}>{label}</span>
      <span style={{ color: 'var(--base-foreground)', fontWeight: bold ? 700 : 500 }}>{value}</span>
    </div>
  );
}

export function Divider() {
  return (
    <hr style={{ border: 'none', borderTop: '1px solid var(--base-secondary)', margin: '4px 0' }} />
  );
}

/** Bordered card for review-step summaries. */
export function SummaryCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border: '1px solid var(--base-border)',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

/* ================================================================
   COMPONENTS — Success Screen
   ================================================================ */

interface SuccessScreenProps {
  title: string;
  subtitle: React.ReactNode;
  badges?: React.ReactNode;
  details?: React.ReactNode;
  onReset: () => void;
  resetLabel?: string;
}

export function SuccessScreen({
  title,
  subtitle,
  badges,
  details,
  onReset,
  resetLabel = 'Start Over',
}: SuccessScreenProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'var(--status-success-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: 28,
        }}
      >
        &#10003;
      </div>
      <h2
        style={{ fontSize: 20, fontWeight: 700, color: 'var(--base-foreground)', marginBottom: 8 }}
        data-testid="success-message"
      >
        {title}
      </h2>
      <p style={{ fontSize: 14, color: 'var(--base-muted-foreground)', marginBottom: 24 }}>
        {subtitle}
      </p>
      {badges && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
          {badges}
        </div>
      )}
      {details && (
        <div
          style={{
            border: '1px solid var(--base-border)',
            borderRadius: 12,
            padding: 20,
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {details}
        </div>
      )}
      <div style={{ marginTop: 24 }}>
        <ArdaButton variant="primary" onClick={onReset}>
          {resetLabel}
        </ArdaButton>
      </div>
    </div>
  );
}

/* ================================================================
   COMPONENTS — Guide Panel
   ================================================================ */

function GuidePanel({ guide }: { guide: GuideEntry }) {
  return (
    <div
      data-testid="guide-panel"
      style={{
        borderLeft: '4px solid var(--accent-blue)',
        background: 'var(--guide-bg)',
        borderRadius: '0 8px 8px 0',
        padding: '16px 20px',
        fontSize: 13,
        lineHeight: 1.6,
        color: 'var(--guide-text)',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{guide.title}</div>
      <p style={{ margin: '0 0 10px' }}>{guide.description}</p>
      <div
        style={{
          background: 'var(--status-info-bg)',
          borderRadius: 6,
          padding: '10px 14px',
          fontSize: 12,
        }}
      >
        <span style={{ fontWeight: 700 }}>Expected interaction: </span>
        {guide.interaction}
      </div>
    </div>
  );
}

/* ================================================================
   COMPONENTS — Story Control Bar
   ================================================================ */

function StoryControlBar({
  current,
  total,
  onPrev,
  onNext,
  onReset,
}: {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
}) {
  const btn = (disabled: boolean): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 6,
    border: '1px solid var(--base-border-strong)',
    background: disabled ? 'var(--base-secondary)' : 'var(--base-background)',
    color: disabled ? 'var(--base-muted)' : 'var(--base-foreground)',
    cursor: disabled ? 'default' : 'pointer',
    fontWeight: 600,
    fontSize: 13,
  });

  return (
    <div
      data-testid="story-controls"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--base-secondary)',
        border: '1px solid var(--base-border)',
        borderRadius: 8,
        padding: '10px 16px',
        fontSize: 13,
      }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={onPrev} disabled={current <= 1} style={btn(current <= 1)}>
          &#9664; Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={current >= total}
          style={btn(current >= total)}
        >
          Next &#9654;
        </button>
      </div>
      <span style={{ color: 'var(--base-muted-foreground)', fontWeight: 500 }}>
        Scene {current} of {total}
      </span>
      <button type="button" onClick={onReset} style={btn(false)}>
        Reset
      </button>
    </div>
  );
}

/* ================================================================
   COMPONENTS — Step Indicator
   ================================================================ */

function StepIndicator({
  steps,
  current,
  onStepClick,
}: {
  steps: readonly string[];
  current: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
      {steps.map((label, i) => {
        const isActive = i === current;
        const isComplete = i < current;
        return (
          <div
            key={label}
            role="button"
            tabIndex={0}
            onClick={() => onStepClick(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onStepClick(i);
              }
            }}
            style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 700,
                color: isActive || isComplete ? 'var(--base-background)' : 'var(--base-muted)',
                background: isComplete
                  ? 'var(--step-complete)'
                  : isActive
                    ? 'var(--base-primary)'
                    : 'var(--base-border)',
                marginBottom: 4,
              }}
            >
              {isComplete ? '\u2713' : i + 1}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? 'var(--base-foreground)' : 'var(--base-muted-foreground)',
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================
   HOOK — useWizard
   ================================================================ */

export function useWizard<T extends object>(
  props: WizardProps<T>,
  config: WizardConfig<T>,
): WizardState<T> {
  const [step, setStep] = useState(props.initialStep ?? 0);
  const [submitted, setSubmitted] = useState(props.initialSubmitted ?? false);
  const [formData, setFormData] = useState<T>(props.initialFormData ?? config.initial);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }) as T);
  };

  const handleReset = () => {
    setFormData(config.initial);
    setStep(0);
    setSubmitted(false);
  };

  const goToStep = (s: number) => setStep(s);
  const handleSubmit = () => setSubmitted(true);

  return {
    step,
    formData,
    setFormData,
    submitted,
    phase: submitted ? config.stepNames.length : step,
    stepNames: config.stepNames,
    canAdvance: config.canAdvance(step, formData),
    showGuide: props.showGuide ?? false,
    handleChange,
    handleReset,
    goToStep,
    handleSubmit,
  };
}

/* ================================================================
   COMPONENT — UseCaseShell
   ================================================================ */

interface UseCaseShellProps {
  wizard: WizardControl;
  guides: GuideEntry[];
  heading: string;
  subtitle: string;
  submitLabel: string;
  success: React.ReactNode;
  children: React.ReactNode;
}

export function UseCaseShell({
  wizard: w,
  guides,
  heading,
  subtitle,
  submitLabel,
  success,
  children,
}: UseCaseShellProps) {
  const isLastStep = w.step === w.stepNames.length - 1;
  const stepName = w.stepNames[w.step] ?? '';

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div
        style={{
          border: '1px solid var(--base-border)',
          borderRadius: 12,
          padding: 24,
          background: 'var(--base-background)',
        }}
      >
        {/* heading bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 4,
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--base-foreground)', margin: 0 }}>
            {heading}
          </h1>
          {!w.submitted && (
            <button
              type="button"
              onClick={w.handleReset}
              data-testid="reset-button"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                color: 'var(--base-muted-foreground)',
                textDecoration: 'underline',
                padding: '4px 0',
              }}
            >
              Reset
            </button>
          )}
        </div>

        {!w.submitted && (
          <p style={{ fontSize: 14, color: 'var(--base-muted-foreground)', marginBottom: 24 }}>
            {subtitle}
          </p>
        )}
        {!w.submitted && (
          <StepIndicator steps={w.stepNames} current={w.step} onStepClick={w.goToStep} />
        )}

        {/* success or step content */}
        {w.submitted && success}
        {!w.submitted && (
          <>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              Step {w.step + 1} &mdash; {stepName}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{children}</div>
            {/* navigation */}
            <div
              style={{
                display: 'flex',
                justifyContent: w.step > 0 ? 'space-between' : 'flex-end',
                marginTop: 24,
              }}
            >
              {w.step > 0 && (
                <ArdaButton
                  variant="secondary"
                  type="button"
                  onClick={() => w.goToStep(w.step - 1)}
                >
                  &larr; Back
                </ArdaButton>
              )}
              {isLastStep ? (
                <ArdaButton variant="primary" type="button" onClick={w.handleSubmit}>
                  {submitLabel}
                </ArdaButton>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <ArdaButton variant="secondary" type="button" onClick={w.handleSubmit}>
                    Done
                  </ArdaButton>
                  <ArdaButton
                    variant="primary"
                    type="button"
                    disabled={!w.canAdvance}
                    onClick={() => w.goToStep(w.step + 1)}
                  >
                    Next Step &rarr;
                  </ArdaButton>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* guide panel (Interactive mode only) */}
      {w.showGuide && guides[w.phase] && (
        <div style={{ marginTop: 16 }}>
          <GuidePanel guide={guides[w.phase] as GuideEntry} />
        </div>
      )}
    </div>
  );
}

/* ================================================================
   VIEWERS (internal — used by createUseCaseStories)
   ================================================================ */

function StepwiseViewer<T extends object>({
  scenes,
  Wizard,
}: {
  scenes: Scene<T>[];
  Wizard: React.ComponentType<WizardProps<T>>;
}) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const scene = scenes[sceneIndex] as Scene<T>;

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ pointerEvents: 'none', opacity: 0.95 }}>
        <Wizard
          key={sceneIndex}
          initialStep={scene.wizardStep}
          initialFormData={scene.formData}
          initialSubmitted={scene.submitted}
        />
      </div>
      <div style={{ marginTop: 16 }}>
        <GuidePanel guide={scene} />
      </div>
      <div style={{ marginTop: 12 }}>
        <StoryControlBar
          current={sceneIndex + 1}
          total={scenes.length}
          onPrev={() => setSceneIndex((i) => Math.max(0, i - 1))}
          onNext={() => setSceneIndex((i) => Math.min(scenes.length - 1, i + 1))}
          onReset={() => setSceneIndex(0)}
        />
      </div>
    </div>
  );
}

function AutomatedViewer<T extends object>({
  scenes,
  Wizard,
}: {
  scenes: Scene<T>[];
  Wizard: React.ComponentType<WizardProps<T>>;
}) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: Event) => {
      setSceneIndex((e as CustomEvent).detail as number);
    };
    el.addEventListener('scene-change', handler);
    return () => el.removeEventListener('scene-change', handler);
  }, []);

  const scene = scenes[sceneIndex] as Scene<T>;

  return (
    <div
      ref={containerRef}
      data-testid="automated-viewer"
      style={{ maxWidth: 560, margin: '0 auto' }}
    >
      <Wizard />
      <div style={{ marginTop: 16 }}>
        <GuidePanel guide={scene} />
      </div>
    </div>
  );
}

/* ================================================================
   FACTORY — createUseCaseStories
   ================================================================ */

export function createUseCaseStories<T extends object>(
  config: UseCaseConfig<T>,
): { Interactive: StoryObj; Stepwise: StoryObj; Automated: StoryObj } {
  const Interactive: StoryObj = {
    render: () => <config.Wizard showGuide />,
  };

  const Stepwise: StoryObj = {
    render: () => <StepwiseViewer scenes={config.scenes} Wizard={config.Wizard} />,
  };

  const delayMs = config.delayMs ?? 2000;

  const Automated: StoryObj = {
    render: () => <AutomatedViewer scenes={config.scenes} Wizard={config.Wizard} />,
    play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const canvas = within(canvasElement);
      const delay = () => new Promise<void>((r) => setTimeout(r, delayMs));
      const viewer = canvas.getByTestId('automated-viewer');
      const goToScene = (index: number) => {
        viewer.dispatchEvent(new CustomEvent('scene-change', { detail: index }));
      };
      await config.play({ canvas, goToScene, delay });
    },
  };

  return { Interactive, Stepwise, Automated };
}
