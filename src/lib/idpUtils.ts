import { IndividualDevelopmentPlan } from '@/types';

export type IDPStatus = 'Aktiv' | 'Slutförd' | 'Försenad';

export function getIDPStatus(idp: IndividualDevelopmentPlan): IDPStatus {
   if (idp.completed) return 'Slutförd';
   if (!idp.endDate) return 'Aktiv';
  
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   const end = new Date(idp.endDate);
   end.setHours(0, 0, 0, 0);

   if (end < today) return 'Försenad';
   return 'Aktiv';
}

export function getIDPStatusVariant(status: IDPStatus): 'default' | 'destructive' | 'secondary' {
  switch (status) {
    case 'Active': return 'default';
    case 'Completed': return 'secondary';
    case 'Overdue': return 'destructive';
  }
}

export function isIDPActive(idp: IndividualDevelopmentPlan): boolean {
  return getIDPStatus(idp) !== 'Completed';
}
