'use client'

import { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shadcn/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shadcn/components/ui/tabs'
import { ScrollArea } from '@/shadcn/components/ui/scroll-area'
import { Skeleton } from '@/shadcn/components/ui/skeleton'
import { ExternalLink } from 'lucide-react'

type DocumentKey = 'privacy' | 'customer' | 'pricing'

interface DocumentConfig {
  key: DocumentKey
  label: string
  filename: string
}

const DOCUMENTS: DocumentConfig[] = [
  { key: 'privacy', label: 'Privacy Policy', filename: 'privacy-policy.md' },
  { key: 'customer', label: 'Customer Agreement', filename: 'customer-agreement.md' },
  { key: 'pricing', label: 'Pricing', filename: 'pricing.md' },
]

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/0debt/0debt-infra/main/docs/agreements'
const GITHUB_VIEW_BASE = 'https://github.com/0debt/0debt-infra/blob/main/docs/agreements'

interface TermsDialogProps {
  children: React.ReactNode
}

export function TermsDialog({ children }: TermsDialogProps) {
  const [open, setOpen] = useState(false)
  const [documents, setDocuments] = useState<Record<DocumentKey, string | null>>({
    privacy: null,
    customer: null,
    pricing: null,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<DocumentKey, boolean>>({
    privacy: false,
    customer: false,
    pricing: false,
  })

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    const newDocs: Record<DocumentKey, string | null> = { privacy: null, customer: null, pricing: null }
    const newErrors: Record<DocumentKey, boolean> = { privacy: false, customer: false, pricing: false }

    await Promise.all(
      DOCUMENTS.map(async (doc) => {
        try {
          const res = await fetch(`${GITHUB_RAW_BASE}/${doc.filename}`)
          if (!res.ok) throw new Error('Failed to fetch')
          newDocs[doc.key] = await res.text()
        } catch {
          newErrors[doc.key] = true
        }
      })
    )

    setDocuments(newDocs)
    setErrors(newErrors)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (open && !documents.privacy && !loading) {
      fetchDocuments()
    }
  }, [open, documents.privacy, loading, fetchDocuments])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Terms & Conditions</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="privacy" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start">
            {DOCUMENTS.map((doc) => (
              <TabsTrigger key={doc.key} value={doc.key}>
                {doc.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {DOCUMENTS.map((doc) => (
            <TabsContent key={doc.key} value={doc.key} className="flex-1 min-h-0 mt-4">
              <ScrollArea className="h-[60vh] pr-4">
                {loading ? (
                  <LoadingSkeleton />
                ) : errors[doc.key] ? (
                  <ErrorFallback filename={doc.filename} label={doc.label} />
                ) : documents[doc.key] ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-li:text-muted-foreground prose-table:text-sm prose-th:text-foreground prose-td:text-muted-foreground">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {documents[doc.key]!}
                    </ReactMarkdown>
                  </div>
                ) : null}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-6 w-1/2 mt-6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-6 w-1/2 mt-6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

function ErrorFallback({ filename, label }: { filename: string; label: string }) {
  const viewUrl = `${GITHUB_VIEW_BASE}/${filename}`
  
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-muted-foreground mb-4">
        Unable to load the {label}. Please view it directly on GitHub.
      </p>
      <a
        href={viewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-primary hover:underline"
      >
        View {label} on GitHub
        <ExternalLink className="size-4" />
      </a>
    </div>
  )
}
