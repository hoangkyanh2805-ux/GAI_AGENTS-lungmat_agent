import { Skill } from '../types';
import { StartSkill } from './start';
import { HelpSkill } from './help';
import { ReportTodaySkill } from './reportToday';
import { CheckErrorsSkill } from './checkErrors';
import { AuditPipelineSkill } from './auditPipeline';
import { CheckPendingSkill } from './checkPending';
import { CreateBriefSkill } from './createBrief';
import { LeadCaptureSkill } from './leadCapture';
import { ProductInfoSkill } from './productInfo';

export function buildSupportSkills(): Skill[] {
  return [
    new StartSkill(),
    new HelpSkill(),
    new ReportTodaySkill(),
    new CheckErrorsSkill(),
    new AuditPipelineSkill(),
    new CheckPendingSkill(),
  ];
}

export function buildSalesSkills(): Skill[] {
  return [
    new CreateBriefSkill(),
    new LeadCaptureSkill(),
    new ProductInfoSkill(),
  ];
}

// Backward-compatible aggregate — used by legacy code and db scripts
export function buildSkillRegistry(): Skill[] {
  return [...buildSupportSkills(), ...buildSalesSkills()];
}
