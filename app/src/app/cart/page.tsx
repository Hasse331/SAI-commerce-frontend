import { Box, Container, Heading } from "@chakra-ui/react";
import { CartContent } from "@/components/cart/cart-content";

export default function CartRoutePage() {
  return (
    <Container maxW="container.lg" py={{ base: 8, md: 12 }}>
      <Box as="section">
        <Heading as="h1" size="2xl" mb={8}>
          Cart
        </Heading>
        <CartContent />
      </Box>
    </Container>
  );
}
