
"use client"

import { useState } from 'react';
import AppLayout from '@/components/layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Search, ListFilter, FileDown } from 'lucide-react';

const mockRequests = [
  { id: 1, orderId: 'ORD123456', csiId: 'CSI-98765', status: 'Completed', submittedAt: '2023-10-27T10:00:00Z' },
  { id: 2, orderId: 'ORD123457', csiId: 'CSI-98766', status: 'In Progress', submittedAt: '2023-10-26T14:30:00Z' },
  { id: 3, orderId: 'ORD123458', csiId: 'CSI-98767', status: 'Failed', submittedAt: '2023-10-25T09:15:00Z' },
  { id: 4, orderId: 'ORD123459', csiId: 'CSI-98768', status: 'Completed', submittedAt: '2023-10-24T17:45:00Z' },
  { id: 5, orderId: 'ORD123460', csiId: 'CSI-98769', status: 'Pending', submittedAt: '2023-10-23T11:05:00Z' },
];

type Status = 'Completed' | 'In Progress' | 'Failed' | 'Pending';

const statusVariant: Record<Status, 'success' | 'secondary' | 'destructive' | 'default'> = {
    'Completed': 'success',
    'In Progress': 'secondary',
    'Failed': 'destructive',
    'Pending': 'default'
};


export default function SubmittedRequestsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilters, setStatusFilters] = useState<Status[]>(['Completed', 'In Progress', 'Failed', 'Pending']);

    const filteredRequests = mockRequests.filter(req => {
        const matchesSearch = req.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || req.csiId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilters.includes(req.status as Status);
        return matchesSearch && matchesStatus;
    });

    const handleStatusFilterChange = (status: Status) => {
        setStatusFilters(prev => 
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
    }

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Submitted Requests</CardTitle>
            <CardDescription>
              Browse and manage all previously submitted XSLT mapping requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by Order ID or CSI ID..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <ListFilter className="mr-2 h-4 w-4" />
                            Filter by Status
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {Object.keys(statusVariant).map((status) => (
                             <DropdownMenuCheckboxItem
                                key={status}
                                checked={statusFilters.includes(status as Status)}
                                onCheckedChange={() => handleStatusFilterChange(status as Status)}
                            >
                                {status}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                 <Button>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </div>
            <div className="border rounded-md">
                <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>CSI ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredRequests.map(req => (
                    <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.orderId}</TableCell>
                        <TableCell>{req.csiId}</TableCell>
                        <TableCell>
                            <Badge variant={statusVariant[req.status as Status]}>{req.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(req.submittedAt).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                            <Button variant="ghost" size="sm">View Details</Button>
                        </TableCell>
                    </TableRow>
                    ))}
                    {filteredRequests.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">
                                No requests found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
