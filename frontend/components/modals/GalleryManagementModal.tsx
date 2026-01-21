import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import  AlertModal  from './AlertModal';
import { useAlertModal } from '../../hooks/useAlertModal';
import ConfirmationModal from './ConfirmationModal';
import * as ImagePicker from 'expo-image-picker';

const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  BORDER_RADIUS: 15,
  BUTTON_HEIGHT: 50,
  GALLERY_IMAGE_SIZE: 80,
} as const;

const SPACING = {
  TINY: 4,
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 20,
  HUGE: 24,
} as const;

const COLORS = {
  PRIMARY_BROWN: '#493628',
  LIGHT_BROWN: '#AB886D',
  BACKGROUND: '#E4E0E1',
  CARD_BACKGROUND: '#FFFFFF',
  SUCCESS_GREEN: '#51CF66',
  ERROR_RED: '#FF6B6B',
  WARNING_YELLOW: '#FFD43B',
  GRAY_DARK: '#797979',
  GRAY_LIGHT: '#D6C0B3',
};

const FONT_RATIOS = {
  TITLE: 0.045,
  BODY_TEXT: 0.035,
  LABEL_TEXT: 0.032,
  BUTTON_TEXT: 0.042,
} as const;

interface GalleryData {
  mainImage: any | null;
  galleryImages: any[];
}

interface GalleryManagementModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: GalleryData) => void;
  initialData?: GalleryData;
  mode: 'create' | 'manage';
  petName?: string;
  isLoading?: boolean;
}

const GalleryManagementModal: React.FC<GalleryManagementModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData = { mainImage: null, galleryImages: [] },
  mode,
  petName = 'this pet',
  isLoading = false,
}) => {
  const { width } = useWindowDimensions();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();

  const [confirmationModal, setConfirmationModal] = useState<{
    visible: boolean;
    type: 'remove' | 'change' | null;
    data?: any;
  }>({ visible: false, type: null });

  const [galleryData, setGalleryData] = useState<GalleryData>(initialData);

  useEffect(() => {
    console.log("GALLERY MODAL opened");
    setGalleryData(initialData);
  }, [initialData]);

  const titleFontSize = width * FONT_RATIOS.TITLE;
  const bodyTextFontSize = width * FONT_RATIOS.BODY_TEXT;
  const labelTextFontSize = width * FONT_RATIOS.LABEL_TEXT;
  const buttonTextFontSize = width * FONT_RATIOS.BUTTON_TEXT;

  const gridPadding = DESIGN_CONSTANTS.HORIZONTAL_PADDING * 2;
  const gridSpacing = SPACING.MEDIUM;
  const availableWidth = width - gridPadding;
  const imageSize = (availableWidth - (gridSpacing * 2)) / 3; 

  const isFormValid = mode === 'manage' || galleryData.mainImage !== null;

  const handleMainImagePicker = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert({
          title: 'Permission Denied',
          message: 'Permission to access media library is required.',
          type: 'error',
          buttonText: 'OK',
        });
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const filename = asset.fileName || asset.uri.split('/').pop() || 'pet-main.jpg';
        setGalleryData(prev => ({
          ...prev,
          mainImage: { 
            uri: asset.uri,
            mimeType: asset.mimeType,
            name: filename,
            isLocal: true,
          },
        }));
        
        showAlert({
          title: 'Photo Selected',
          message: 'Main photo has been selected successfully.',
          type: 'success',
          buttonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Main image picker error:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to select photo. Please try again.',
        type: 'error',
        buttonText: 'OK',
      });
    }
  }, [showAlert]);

  const handleGalleryImagePicker = useCallback(async () => {
    try {
      // Ask for permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert({
          title: 'Permission Denied',
          message: 'Permission to access media library is required.',
          type: 'error',
          buttonText: 'OK',
        });
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const filename = asset.fileName || asset.uri.split('/').pop() || 'pet-gallery.jpg';
        setGalleryData(prev => ({
          ...prev,
          galleryImages: [
            ...prev.galleryImages,
            { 
              uri: asset.uri,
              mimeType: asset.mimeType,
              name: filename,
              isLocal: true,
            },
          ],
        }));
        
        showAlert({
          title: 'Photo Added',
          message: 'Gallery photo has been added successfully.',
          type: 'success',
          buttonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Gallery image picker error:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to select photo. Please try again.',
        type: 'error',
        buttonText: 'OK',
      });
    }
  }, [showAlert]);

  const handleRemoveGalleryImage = useCallback((index: number) => {
    setConfirmationModal({
      visible: true,
      type: 'remove',
      data: { index },
    });
  }, []);

  const handleConfirmRemoveImage = useCallback(() => {
    if (confirmationModal.data?.index !== undefined) {
      setGalleryData(prev => ({
        ...prev,
        galleryImages: prev.galleryImages.filter((_, i) => i !== confirmationModal.data.index),
      }));
    }
    setConfirmationModal({ visible: false, type: null });
  }, [confirmationModal.data]);

  const handleChangeMainImage = useCallback(() => {
    setConfirmationModal({
      visible: true,
      type: 'change',
    });
  }, []);

  const handleConfirmChangeMainImage = useCallback(() => {
    setConfirmationModal({ visible: false, type: null });
    handleMainImagePicker();
  }, [handleMainImagePicker]);

  const handleCancelConfirmation = useCallback(() => {
    setConfirmationModal({ visible: false, type: null });
  }, []);

  const handleSave = useCallback(() => {
    if (!isFormValid) {
      showAlert({
        title: 'Main Photo Required',
        message: 'Please select a main photo for the pet before saving.',
        type: 'error',
        buttonText: 'OK',
      });
      return;
    }

    onSave(galleryData);
  }, [galleryData, isFormValid, onSave, showAlert]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const renderGalleryItem = useCallback(({ item, index }: { item: any; index: number }) => {
    if (item.isAddButton) {
      return (
        <TouchableOpacity
          style={[styles.addImageButton, { width: imageSize, height: imageSize }]}
          onPress={handleGalleryImagePicker}
        >
          <Ionicons name="add" size={30} color={COLORS.GRAY_DARK} />
          <Text style={[styles.addImageText, { fontSize: labelTextFontSize }]}>
            Add Photo
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.galleryImageContainer, { width: imageSize, height: imageSize }]}>
        <Image source={item} style={styles.galleryImage} />
        <TouchableOpacity
          style={styles.removeImageButton}
          onPress={() => handleRemoveGalleryImage(index)}
        >
          <Ionicons name="close" size={16} color={COLORS.CARD_BACKGROUND} />
        </TouchableOpacity>
      </View>
    );
  }, [imageSize, handleGalleryImagePicker, handleRemoveGalleryImage, labelTextFontSize]);

  const flatListData = [
    ...galleryData.galleryImages,
    ...(galleryData.galleryImages.length < 10 ? [{ isAddButton: true }] : []),
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.modalCloseButton}
          >
            <Ionicons name="close" size={24} color={COLORS.GRAY_DARK} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { fontSize: titleFontSize }]}>
            {mode === 'create' ? 'Add Pet Photos' : 'Manage Photos'}
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.modalSaveButton}
            disabled={!isFormValid || isLoading}
          >
            <Text style={[
              styles.modalSaveText,
              { fontSize: buttonTextFontSize },
              (!isFormValid || isLoading) && styles.modalSaveTextDisabled
            ]}>
              {isLoading ? 'Saving...' : 'Done'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.modalDescription, { fontSize: bodyTextFontSize }]}>
            {mode === 'create' 
              ? `Add photos for ${petName}. A main photo is required, and you can add up to 10 additional gallery photos.`
              : `Manage photos for ${petName}. You can change the main photo and add/remove gallery photos at any time.`
            }
          </Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: titleFontSize }]}>
              Main Photo {mode === 'create' && '*'}
            </Text>
            <Text style={[styles.sectionDescription, { fontSize: labelTextFontSize }]}>
              This photo will be the primary image shown to donors
            </Text>

            <View style={styles.mainImageContainer}>
              {galleryData.mainImage ? (
                <>
                  <Image source={galleryData.mainImage} style={styles.mainImage} />
                  <TouchableOpacity
                    style={styles.changeMainImageButton}
                    onPress={handleChangeMainImage}
                  >
                    <Ionicons name="camera" size={20} color={COLORS.CARD_BACKGROUND} />
                    <Text style={[styles.changeMainImageText, { fontSize: labelTextFontSize }]}>
                      Change Photo
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.selectMainImageButton}
                  onPress={handleMainImagePicker}
                >
                  <Ionicons name="camera-outline" size={40} color={COLORS.GRAY_DARK} />
                  <Text style={[styles.selectMainImageText, { fontSize: bodyTextFontSize }]}>
                    Select Main Photo
                  </Text>
                  <Text style={[styles.selectMainImageSubtext, { fontSize: labelTextFontSize }]}>
                    Choose from camera or gallery
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: titleFontSize }]}>
              Gallery Photos
            </Text>
            <Text style={[styles.sectionDescription, { fontSize: labelTextFontSize }]}>
              Add up to 10 additional photos to showcase the pet's personality
            </Text>

            <View style={styles.galleryGrid}>
              <FlatList
                data={flatListData}
                numColumns={3}
                scrollEnabled={false}
                renderItem={renderGalleryItem}
                keyExtractor={(item, index) => index.toString()}
                columnWrapperStyle={styles.galleryRow}
                contentContainerStyle={styles.galleryContainer}
              />
            </View>

            <View style={styles.galleryInfo}>
              <Text style={[styles.galleryInfoText, { fontSize: labelTextFontSize }]}>
                 {galleryData.galleryImages.length}/10 photos added
              </Text>
              {galleryData.galleryImages.length >= 10 && (
                <Text style={[styles.galleryMaxText, { fontSize: labelTextFontSize }]}>
                  Maximum photos reached. Remove a photo to add new ones.
                </Text>
              )}
            </View>
          </View>


          <View style={styles.bottomSpacing} />
        </ScrollView>

        <ConfirmationModal
          visible={confirmationModal.visible}
          type={confirmationModal.type === 'remove' ? 'delete' : 'change'}
          onConfirm={confirmationModal.type === 'remove' ? handleConfirmRemoveImage : handleConfirmChangeMainImage}
          onCancel={handleCancelConfirmation}
        />

        <AlertModal
          visible={isVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttonText={alertConfig.buttonText}
          type={alertConfig.type}
          onClose={hideAlert}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingVertical: SPACING.MEDIUM,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY_LIGHT,
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  modalCloseButton: {
    padding: SPACING.SMALL,
  },
  modalTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },
  modalSaveButton: {
    padding: SPACING.SMALL,
  },
  modalSaveText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },
  modalSaveTextDisabled: {
    color: COLORS.GRAY_DARK,
  },
  modalContent: {
    flex: 1,
    padding: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
  },
  modalDescription: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginBottom: SPACING.EXTRA_LARGE,
    lineHeight: 22,
  },

  section: {
    marginBottom: SPACING.EXTRA_LARGE,
  },
  sectionTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.SMALL,
  },
  sectionDescription: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginBottom: SPACING.MEDIUM,
    lineHeight: 18,
  },

  mainImageContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  mainImage: {
    width: 200,
    height: 200,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    marginBottom: SPACING.MEDIUM,
  },
  changeMainImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.LIGHT_BROWN,
    paddingHorizontal: SPACING.LARGE,
    paddingVertical: SPACING.SMALL,
    borderRadius: 25,
    gap: SPACING.SMALL,
  },
  changeMainImageText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.CARD_BACKGROUND,
  },
  selectMainImageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderWidth: 2,
    borderColor: COLORS.GRAY_LIGHT,
    borderStyle: 'dashed',
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    width: 200,
    height: 200,
    gap: SPACING.SMALL,
  },
  selectMainImageText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },
  selectMainImageSubtext: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
  },

  galleryGrid: {
    marginBottom: SPACING.MEDIUM,
  },
  galleryContainer: {
    gap: SPACING.MEDIUM,
  },
  galleryRow: {
    justifyContent: 'space-between',
  },
  galleryImageContainer: {
    position: 'relative',
    borderRadius: SPACING.SMALL,
    overflow: 'hidden',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: SPACING.SMALL,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.ERROR_RED,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    borderWidth: 2,
    borderColor: COLORS.GRAY_LIGHT,
    borderStyle: 'dashed',
    borderRadius: SPACING.SMALL,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.CARD_BACKGROUND,
    gap: SPACING.TINY,
  },
  addImageText: {
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.GRAY_DARK,
  },

  galleryInfo: {
    alignItems: 'center',
    gap: SPACING.SMALL,
  },
  galleryInfoText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.PRIMARY_BROWN,
  },
  galleryMaxText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.WARNING_YELLOW,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  tipsContainer: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.MEDIUM,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.SUCCESS_GREEN,
  },
  tipsTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.MEDIUM,
  },
  tipsList: {
    gap: SPACING.SMALL,
  },
  tipItem: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    lineHeight: 18,
  },

  bottomSpacing: {
    height: 40,
  },
});

export default GalleryManagementModal;