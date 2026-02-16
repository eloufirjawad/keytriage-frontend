'use client'

import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

type FaqItem = {
  q: string
  a: string
}

type FaqAccordionProps = {
  items: FaqItem[]
  className?: string
}

const FaqAccordion = ({ items, className }: FaqAccordionProps) => {
  return (
    <Box className={className}>
      {items.map((item, index) => (
        <Accordion
          key={item.q}
          defaultExpanded={index === 0}
          disableGutters
          square={false}
          sx={{
            border: '1px solid',
            borderColor: 'var(--line)',
            borderRadius: '12px !important',
            boxShadow: 'none',
            overflow: 'hidden',
            backgroundColor: 'var(--surface)',
            '&:before': {
              display: 'none'
            }
          }}
        >
          <AccordionSummary
            expandIcon={
              <Typography component='span' sx={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-dark)' }}>
                +
              </Typography>
            }
            sx={{
              px: 1.5,
              py: 0.25,
              '& .MuiAccordionSummary-content': {
                my: 1.25
              },
              '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                transform: 'rotate(45deg)'
              }
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--ink)' }}>{item.q}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 1.5, px: 1.5 }}>
            <Typography sx={{ color: 'var(--muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>{item.a}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}

export default FaqAccordion
