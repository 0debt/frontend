'use client'

import { Group } from '@/app/lib/mock-data/groups'
import { Button } from '@/shadcn/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shadcn/components/ui/select'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type GroupSelectorProps = {
  groups: Group[]
  selectedGroupId: string
  basePath?: string
}

export function GroupSelector({ groups, selectedGroupId, basePath = '/expenses' }: GroupSelectorProps) {
  const router = useRouter()

  const handleChange = (groupId: string) => {
    router.push(`${basePath}?group=${groupId}`)
  }

  if (groups.length === 0) {
    return (
      <Button asChild variant="outline" className="w-[200px] justify-between">
        <Link href="/groups/new">
          Create Group
          <Plus className="h-4 w-4 opacity-50" />
        </Link>
      </Button>
    )
  }

  return (
    <Select value={selectedGroupId} onValueChange={handleChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a group" />
      </SelectTrigger>
      <SelectContent>
        {groups.map((group) => (
          <SelectItem key={group._id} value={group._id}>
            {group.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
