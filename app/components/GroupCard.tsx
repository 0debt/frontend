import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shadcn/components/ui/card'
import { Badge } from '@/shadcn/components/ui/badge'
import { Users } from 'lucide-react'
import { Link } from 'next-view-transitions'
import type { Group } from '@/app/lib/mock-data/groups'

import Image from 'next/image'

type GroupCardProps = {
  group: Group
  isOwner?: boolean
}

export function GroupCard({ group, isOwner }: GroupCardProps) {
  return (
    <Link href={`/groups/${group._id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full overflow-hidden pt-0 gap-0">
        {group.imageUrl && (
           <div className="h-32 w-full overflow-hidden relative border-b">
             <Image 
               src={group.imageUrl} 
               alt={group.name} 
               fill
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
               className="object-cover transition-transform duration-500 hover:scale-110"
             />
           </div>
        )}
        <CardHeader className="pb-2 pt-6">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{group.name}</CardTitle>
            {isOwner && (
              <Badge variant="secondary" className="shrink-0">
                Owner
              </Badge>
            )}
          </div>
          {group.description && (
            <CardDescription className="line-clamp-2">
              {group.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{group.members.length} members</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
