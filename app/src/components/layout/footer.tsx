import {
  Box,
  Container,
  Text,
  HStack,
  Flex,
  Spacer,
  Separator,
  Stack,
} from "@chakra-ui/react";

export default function Footer() {
  return (
    <Box>
      <Flex gap={5} align={"center"} padding={10}>
        <Container>
          <Stack>
            <Stack direction={{ base: "column", md: "row" }} gap="10">
              <Box h="5">Branding box</Box>
              <Spacer />
              <Box h="5">Footer navigation 1</Box>
              <Spacer />
              <Box h="5">Footer navigation 2</Box>
              <Spacer />
              <Box h="5">Contact info</Box>
            </Stack>

            <Separator mt={5} />
            <Text pt={8} textAlign="center">
              © {new Date().getFullYear()} APP-NAME All rights reserved.
            </Text>
          </Stack>
        </Container>
      </Flex>
    </Box>
  );
}
