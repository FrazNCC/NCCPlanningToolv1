
import { Teacher, Course } from './types';

export const initialTeachers: Teacher[] = [
  { id: 'AB', name: 'AB', allowance: 18.4 },
  { id: 'AH', name: 'AH', allowance: 23 },
  { id: 'AI', name: 'AI', allowance: 23 },
  { id: 'AS', name: 'AS', allowance: 23 },
  { id: 'FA', name: 'FA', allowance: 9 },
  { id: 'GM', name: 'GM', allowance: 23 },
  { id: 'IK', name: 'IK', allowance: 13 },
  { id: 'JK', name: 'JK', allowance: 23 },
  { id: 'MA', name: 'MA', allowance: 23 },
  { id: 'MR', name: 'MR', allowance: 23 },
  { id: 'NM', name: 'NM', allowance: 3 },
  { id: 'PC', name: 'PC', allowance: 18.4 },
  { id: 'RG', name: 'RG', allowance: 23 },
  { id: 'SS', name: 'SS', allowance: 23 },
  { id: 'V-TA', name: 'V-TA', allowance: 23 },
  { id: 'VAC-2', name: 'VAC-2', allowance: 0 },
  { id: 'VAC-3', name: 'VAC-3', allowance: 0 },
];

export const initialCourses: Course[] = [
    {
        id: 'c1',
        name: 'BTEC Level 2 - Gp1',
        targetHours: 360,
        units: [
            { id: 'c1u1', name: 'The Online World', assignments: { 'SS': 2 } },
            { id: 'c1u2', name: 'Technology Systems', assignments: {} },
            { id: 'c1u3', name: 'Digital Portfolio', assignments: { 'FA': 1.5 } },
            { id: 'c1u4', name: 'Spreadsheet Development', assignments: {} },
            { id: 'c1u5', name: 'Database Development', assignments: { 'JK': 1.5 } },
            { id: 'c1u6', name: 'Software Development', assignments: { 'RG': 2 } },
            { id: 'c1u7', name: 'Installing & Maintaining Hardware', assignments: { 'AI': 2, 'SS': 2 } },
            { id: 'c1u8', name: 'Computer Networks', assignments: { 'IK': 1 } },
        ]
    },
    {
        id: 'c2',
        name: 'AAQ - IT',
        targetHours: 360,
        units: [
            { id: 'c2u1', name: 'Information Technology Systems', assignments: { 'AH': 4, 'MA': 4 } },
            { id: 'c2u2', name: 'Cybersecurity & Incident Management', assignments: {} },
            { id: 'c2u3', name: 'Website Development', assignments: { 'AB': 1.5 } },
            { id: 'c2u4', name: 'Relational Database Development', assignments: { 'RG': 3, 'IK': 1 } },
        ]
    },
    {
        id: 'c3',
        name: 'Other',
        units: [
            { id: 'c3u1', name: 'Lead IV', assignments: { 'FA': 3 } },
            { id: 'c3u2', name: 'FEYA', assignments: { 'AH': 2 } },
            { id: 'c3u3', name: 'Coordination', assignments: { 'GM': 2, 'MA': 2 } },
            { id: 'c3u4', name: 'Union', assignments: { 'AI': 2 } },
            { id: 'c3u5', name: 'Hackney WD L5', assignments: { 'AB': 5 } },
            { id: 'c3u6', name: 'Hackney SD L3', assignments: { 'PC': 6 } },
        ]
    }
];