import { Box, Divider, Stack } from "@mui/material";
import { BoxProps } from "@mui/system";
import Scrollbar from "react-perfect-scrollbar";
import { SummaryCardItem, Props as ItemsProps } from "../../molecules/cards/SummaryCardItem";

export type Props = {
  containerProps?: BoxProps,
  items: ItemsProps[];
  id?: string;
}

export function SummaryCard(props: Props) {
  return (
    <Box
      {...props?.containerProps}
      sx={{
        backgroundColor: theme => theme.palette.mode === "dark" ? "background.default" : "background.paper",
        borderRadius: "16px",
        boxShadow: 1,
        padding: 0,
        overflow: "hidden",
        ...props?.containerProps?.sx
      }}
      id={props?.id}
    >
      <Scrollbar style={{
          overflow: "hidden",
          overflowX: "auto",
          width: "100%",
          flex: 1,
          padding: "16px",
        }}
      >
        <Stack 
          spacing={0}
          direction="row"
          justifyContent="space-between"
          sx={{
            width: "100%",
          }}
          divider={
            <Divider 
              orientation="vertical" 
              flexItem 
              sx={{
                marginLeft: "15px",
                marginRight: "15px",
                border: "none",
                borderRightWidth: "1px",
                borderRightColor: "divider", 
                borderRightStyle: "dashed"
              }}
            />
          }
        >
          {
            props?.items.map((item, index) => (
              <SummaryCardItem
                key={index}
                title={item?.title}
                subtitle={item?.subtitle}
                value={item?.value}
                icon={item?.icon}
                color={item?.color}  
              />
            ))
          }
        </Stack>
      </Scrollbar>
    </Box>
  )
}