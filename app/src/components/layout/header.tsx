"use client";

import {
  Box,
  Flex,
  HStack,
  Image,
  Link,
  IconButton,
  useDisclosure,
  Stack,
  Container,
  Heading,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { GiHamburgerMenu } from "react-icons/gi";
import { CartIconButton } from "@/components/cart/cart-icon-button";
import { getNavigationLinks } from "@/data/contents/navigation-links";
import type { BrandData } from "@/types/brand";

const NavLink = ({
  label,
  href,
  onClick,
}: {
  label: string;
  href: string;
  onClick?: () => void;
}) => (
  <Link
    as={NextLink}
    px={3}
    py={2}
    rounded="md"
    _hover={{ textDecoration: "none", bg: "gray.500" }}
    href={href}
    onClick={onClick}
  >
    {label}
  </Link>
);

interface HeaderProps {
  hasArticles: boolean;
  brand: BrandData;
}

export default function Header({ hasArticles, brand }: HeaderProps) {
  const { open, onOpen, onClose } = useDisclosure();
  const navigationLinks = getNavigationLinks(hasArticles);

  return (
    <Box bg="layoutBg">
      <Container py={4}>
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <Link
            as={NextLink}
            href="/"
            outline="none"
            _hover={{ textDecoration: "none" }}
            _focusVisible={{
              outline: "2px solid",
              outlineColor: "accentBright",
              outlineOffset: "4px",
            }}
          >
            <HStack gap={3} alignItems="center">
              {brand.logoVertical ? (
                <Image
                  src={brand.logoVertical}
                  alt={brand.name}
                  h="70px"
                  w="auto"
                  objectFit="contain"
                />
              ) : null}
              <Heading fontWeight="bold" fontSize="2xl">
                {brand.name}
              </Heading>
            </HStack>
          </Link>

          <HStack padding={0} alignItems="center">
            <HStack as="nav" padding={2} display={{ base: "none", md: "flex" }}>
              {navigationLinks.map((link) => (
                <NavLink key={link.href} {...link} />
              ))}
            </HStack>

            <CartIconButton />
            <IconButton
              margin={0}
              variant={"outline"}
              size="md"
              aria-label="Open Menu"
              display={{ md: "none" }}
              onClick={open ? onClose : onOpen}
            >
              <GiHamburgerMenu />
            </IconButton>
          </HStack>
        </Flex>

        {open ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as="nav" padding={2}>
              {navigationLinks.map((link) => (
                <NavLink key={link.href} {...link} onClick={onClose} />
              ))}
            </Stack>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
}
