import { Box, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import type { ContactPageData } from "@/types/contact";
import {
  ContactEyebrowIndicator,
} from "./contact-eyebrow-indicator";

interface ContactMethodsCardProps {
  eyebrow: string;
  title: string;
  intro: string;
  items: ContactPageData["contactMethods"];
}

export function ContactMethodsCard({
  eyebrow,
  title,
  intro,
  items,
}: ContactMethodsCardProps) {
  return (
    <Box borderWidth="1px" rounded="lg" p={6}>
      <HStack gap={2} align="center" mb={3}>
        <ContactEyebrowIndicator />
        <Text
          fontSize="sm"
          fontWeight="semibold"
          color="accentBright"
          textTransform="uppercase"
        >
          {eyebrow}
        </Text>
      </HStack>
      <Heading as="h1" size="2xl" mb={4}>
        {title}
      </Heading>
      <Text mb={8}>{intro}</Text>

      <Stack gap={5}>
        {items.map((item) => (
          <Box key={item.label}>
            <Text fontWeight="bold">{item.label}</Text>
            <Text>{item.value}</Text>
            {item.detail && (
              <Text fontSize="sm" color="fgMuted">
                {item.detail}
              </Text>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
