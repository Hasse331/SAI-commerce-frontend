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

const Links = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

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
          <Text padding={5} fontWeight="bold" fontSize="lg">
            APP NAME
          </Text>

          <HStack padding={8} alignItems="center">
            <HStack as="nav" padding={4} display={{ base: "none", md: "flex" }}>
              {Links.map((link) => (
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
              {Links.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </Stack>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
}
