import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import ImageGalleryModal from '../modals/ImageGalleryModal';

interface GallerySectionProps {
  images: readonly any[];
  petName: string;
}

const GallerySection: React.FC<GallerySectionProps> = ({ images, petName }) => {
  const { width } = useWindowDimensions();
  
  // LOCAL STATE 
  const [galleryVisible, setGalleryVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleImagePress = useCallback((imageIndex: number) => {
    setSelectedImageIndex(imageIndex);
    setGalleryVisible(true);
  }, []);

  const handleCloseGallery = useCallback(() => {
    setGalleryVisible(false);
  }, []);

  const HORIZONTAL_PADDING = 40; 
  const IMAGES_PER_ROW = 3;
  const IMAGE_SPACING = 8;
  
  const availableWidth = width - HORIZONTAL_PADDING;
  const totalSpacing = (IMAGES_PER_ROW - 1) * IMAGE_SPACING;
  const imageSize = (availableWidth - totalSpacing) / IMAGES_PER_ROW;

  const normalizedImages = images.map((image) =>
    typeof image === 'string' ? { uri: image } : image
  );

  return (
    <>
      <View style={[styles.galleryGrid, { width: availableWidth }]}>
        {normalizedImages.map((image, index) => (
          <TouchableOpacity 
            key={index} 
            activeOpacity={0.8} 
            onPress={() => handleImagePress(index)}
            style={[
              styles.imageContainer,
              {
                width: imageSize,
                height: imageSize,
                marginRight: (index + 1) % IMAGES_PER_ROW === 0 ? 0 : IMAGE_SPACING,
                marginBottom: IMAGE_SPACING,
              }
            ]}
          >
            <Image source={image} style={styles.gridImage} />
          </TouchableOpacity>
        ))}
      </View>
      
      <ImageGalleryModal
        visible={galleryVisible}
        images={[...normalizedImages]}
        initialIndex={selectedImageIndex}
        petName={petName}
        onClose={handleCloseGallery}
      />
    </>
  );
};

GallerySection.displayName = 'GallerySection';

const styles = StyleSheet.create({
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default GallerySection;