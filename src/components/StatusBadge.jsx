import { Badge } from '@/components/ui/badge';

const statusMap = {
  'New':         'new',
  'Assigned':    'assigned',
  'In Progress': 'inprogress',
  'Pending':     'pending',
  'Resolved':    'resolved',
  'Escalated':   'escalated',
};

const severityMap = {
  'Low':    'low',
  'Medium': 'medium',
  'High':   'high',
};

export function StatusBadge({ status }) {
  return <Badge variant={statusMap[status] || 'default'}>{status}</Badge>;
}

export function SeverityBadge({ severity }) {
  return <Badge variant={severityMap[severity] || 'default'}>{severity}</Badge>;
}