"use client";

import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  useDisclosure,
  Stack,
  Container,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { GiHamburgerMenu } from "react-icons/gi";
import { NavigationLinks } from "@/data/navigation-links";
import { brandData } from "@/data/brand";

const NavLink = ({ label, href }: { label: string; href: string }) => (
  <Link
    as={NextLink}
    px={3}
    py={2}
    rounded="md"
    _hover={{
      textDecoration: "none",
      bg: "gray.500",
    }}
    href={href}
  >
    {label}
  </Link>
);

export default function Header() {
  const { open, onOpen, onClose } = useDisclosure();

  return (
    <Box>
      <Container>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <Link href="/">
            <Text padding={0} fontWeight="bold" fontSize="xl">
              {brandData.name}
            </Text>
          </Link>

          <HStack padding={8} alignItems="center">
            <HStack as="nav" padding={4} display={{ base: "none", md: "flex" }}>
              {NavigationLinks.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </HStack>
          </HStack>

          <IconButton
            margin={3}
            size="md"
            aria-label="Open Menu"
            display={{ md: "none" }}
            onClick={open ? onClose : onOpen}
          >
            <GiHamburgerMenu />
          </IconButton>
        </Flex>

        {open ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as="nav" padding={2}>
              {NavigationLinks.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </Stack>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
}
