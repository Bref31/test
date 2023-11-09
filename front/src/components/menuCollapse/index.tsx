import { ElementType, useEffect, useState } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  LinearProgress,
  SvgIcon,
  Typography,
} from '@mui/material';

interface Props extends React.ComponentProps<typeof Accordion> {
  sectionName: string;
  isLoading?: boolean;
  progress?: number;

  icon: ElementType<any>;
}

function MenuCollapse({
  children,
  icon,
  sectionName,
  isLoading = false,
  progress = undefined,
  ...AccordionProps
}: Props) {
  const [expanded, setExpanded] = useState(false);

  function handleChange() {
    setExpanded(!expanded);
  }

  useEffect(() => {
    if (AccordionProps.disabled && expanded) {
      setExpanded(false);
    }
    // eslint-disable-next-line
  }, [AccordionProps.disabled]);

  return (
    <Accordion
      {...AccordionProps}
      expanded={expanded}
      onChange={handleChange}
      disableGutters
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">
          <SvgIcon component={icon} sx={{ marginRight: '10px' }} />
          {sectionName}
        </Typography>
      </AccordionSummary>
      {isLoading && (
        <LinearProgress
          color="secondary"
          value={progress}
          variant={progress == null ? 'indeterminate' : 'determinate'}
        />
      )}
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}

export default MenuCollapse;
