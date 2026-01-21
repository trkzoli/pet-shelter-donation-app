import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  Image
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AlertModal } from '../../../components/modals';
import { useAlertModal } from '../../../hooks/useAlertModal';
import BannerCard from '../../../components/banner/BannerCard';
import BannerDetailCard from '../../../components/banner/BannerDetailCard';
import axios from 'axios';
import { API_BASE_URL } from '../../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DESIGN_CONSTANTS = {
  HEADER_HEIGHT: 90,
  HORIZONTAL_PADDING: 20,
  BORDER_RADIUS: 12,
  BUTTON_HEIGHT: 50,
  INPUT_HEIGHT: 50,
  CARD_SPACING: 10,
} as const;

const SPACING = {
  TINY: 4,
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 24,
  HUGE: 32,
} as const;

const COLORS = {
  PRIMARY_BROWN: '#493628',
  LIGHT_BROWN: '#AB886D', 
  BACKGROUND: '#E4E0E1',
  CARD_BACKGROUND: '#FFFFFF',
  SUCCESS_GREEN: '#51CF66',
  ERROR_RED: '#FF6B6B',
  GRAY_DARK: '#797979',
  GRAY_LIGHT: '#D6C0B3',
  INPUT_BORDER: '#D6C0B3',
};

interface BannerPreviewPageProps {}

const BannerPreviewPage: React.FC<BannerPreviewPageProps> = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { bannerData, feeInfo } = useLocalSearchParams<{
    bannerData: string;
    feeInfo: string;
  }>();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();
  

  const [creating, setCreating] = useState(false);
  const [shelterData, setShelterData] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<{ uri: string; mimeType?: string; name?: string } | null>(null);


  useEffect(() => {
    const fetchShelterData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API_BASE_URL}/shelters/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShelterData(res.data);
      } catch (error) {
        console.error('Failed to fetch shelter data:', error);
      }
    };
    fetchShelterData();
  }, []);


  const handleImageSelection = useCallback(async () => {
    try {

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showAlert({
          title: 'Permission Denied',
          message: 'Permission to access media library is required to select campaign images.',
          type: 'error',
          buttonText: 'OK'
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled) return;

      const selectedImageData = result.assets[0];

      if (selectedImageData.uri) {
        setSelectedImage({
          uri: selectedImageData.uri,
          mimeType: selectedImageData.mimeType || 'image/jpeg',
          name: selectedImageData.fileName || selectedImageData.uri.split('/').pop() || 'campaign.jpg',
        });
        
        console.log('IMAGE SELECTED:', selectedImageData.uri);
      } else {
        throw new Error('Failed to get image data');
      }

    } catch (error) {
      console.error('Error selecting image:', error);
      showAlert({
        title: 'Error',
        message: 'Failed to select image. Please try again.',
        type: 'error',
        buttonText: 'OK'
      });
    }
  }, [showAlert]);


  const getPriorityColor = useCallback((urgencyLevel: string) => {
    const colors = {
      'low': '#51CF66',    
      'medium': '#FFD43B',    
      'high': '#FF8C42',     
      'critical': '#FF6B6B'  
    };
    return colors[urgencyLevel as keyof typeof colors] || '#FF8C42';
  }, []);

  const parsedBannerData = useMemo(() => {
    try {
      return bannerData ? JSON.parse(bannerData) : null;
    } catch (error) {
      console.error('Error parsing banner data:', error);
      return null;
    }
  }, [bannerData]);

  const parsedFeeInfo = useMemo(() => {
    try {
      return feeInfo ? JSON.parse(feeInfo) : null;
    } catch (error) {
      console.error('Error parsing fee info:', error);
      return null;
    }
  }, [feeInfo]);

  const titleFontSize = width * 0.055;
  const sectionTitleFontSize = width * 0.045;
  const bodyFontSize = width * 0.035;

  const contentWidth = width - (DESIGN_CONSTANTS.HORIZONTAL_PADDING * 2);
  const cardWidth = (contentWidth - DESIGN_CONSTANTS.CARD_SPACING) / 2;
  const cardHeight = cardWidth * 1.35;

  const bannerCardData = useMemo(() => {
    if (!parsedBannerData) return null;
    
    return {
      id: 'preview',
      shelterName: shelterData?.shelterName || 'Your Shelter',
      urgentNeed: parsedBannerData.title, 
      description: parsedBannerData.description,
      targetAmount: parseFloat(parsedBannerData.targetAmount),
      currentAmount: 0, 
      type: 'banner' as const,
      priority: parsedBannerData.urgencyLevel,
      priorityColor: getPriorityColor(parsedBannerData.urgencyLevel),
    };
  }, [parsedBannerData, shelterData, getPriorityColor]);


  const bannerDetailData = useMemo(() => {
    if (!parsedBannerData) return null;
    
          console.log('BANNER DETAIL IMAGE DEBUG:');
    console.log('selectedImage:', selectedImage);
    
    const detailData = {
      id: 'preview',
      shelterName: shelterData?.shelterName || 'Your Shelter',
      title: parsedBannerData.title,
      description: parsedBannerData.description,
      image: selectedImage?.uri || undefined,
      targetAmount: parseFloat(parsedBannerData.targetAmount),
      currentAmount: 0, 
      purpose: parsedBannerData.title,
    };
    
          console.log('PREVIEW - bannerDetailData.image:', detailData.image);
      console.log('PREVIEW - Image type:', typeof detailData.image);
    return detailData;
  }, [parsedBannerData, shelterData, selectedImage]);

  const handleCreateCampaign = useCallback(async () => {
    if (!parsedBannerData || !parsedFeeInfo) {
      showAlert({
        title: 'Error',
        message: 'Invalid campaign data. Please go back and try again.',
        type: 'error',
        buttonText: 'OK'
      });
      return;
    }

    setCreating(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      let imageUrl = undefined;

      if (selectedImage?.uri) {
        try {
          const formData = new FormData();
          formData.append(
            'image',
            {
              uri: selectedImage.uri,
              name: selectedImage.name || `campaign-${Date.now()}.jpg`,
              type: selectedImage.mimeType || 'image/jpeg',
            } as any
          );

          const uploadRes = await fetch(`${API_BASE_URL}/uploads/image?type=campaign_image`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          });
          
          if (!uploadRes.ok) {
            const errorText = await uploadRes.text();
            console.error('Campaign image upload failed:', errorText);
            throw new Error(`Image upload failed: ${uploadRes.status}`);
          }
          
          const uploadResult = await uploadRes.json();
          imageUrl = uploadResult.secureUrl;
          console.log('Campaign image uploaded successfully:', imageUrl);
        } catch (imageError) {
          console.error('Campaign image upload error:', imageError);
          throw new Error('Failed to upload campaign image');
        }
      }

      await axios.post(
        `${API_BASE_URL}/campaigns`,
        {
          title: parsedBannerData.title,
          description: parsedBannerData.description,
          goalAmount: parseFloat(parsedBannerData.targetAmount),
          priority: parsedBannerData.urgencyLevel,
          duration: parsedBannerData.duration,
          image: imageUrl,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      showAlert({
        title: 'Campaign Created!',
        message: `Your "${parsedBannerData.title}" campaign is now live and visible to donors. You'll receive notifications when people donate.`,
        type: 'success',
        buttonText: 'Great!'
      });


      setTimeout(() => {
        router.replace('/(shelter-tabs)/shelter-profile');
      }, 2500);
    } catch (error: any) {
 
      let errorMessage = 'Failed to create campaign. Please try again.';
      
      if (error?.response?.status === 409) {
    
        if (error?.response?.data?.message?.includes('one active campaign')) {
          errorMessage = 'You already have an active campaign running. Please complete or cancel your current campaign before creating a new one.';
        } else {
          errorMessage = error?.response?.data?.message || 'A conflict occurred. Please try again.';
        }
      } else if (error?.response?.status === 400) {

        errorMessage = error?.response?.data?.message || 'Invalid campaign data. Please check your inputs and try again.';
      } else if (error?.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error?.response?.status === 403) {
        errorMessage = 'Access denied. Make sure you are logged in as a verified shelter.';
      } else if (error.message === 'Failed to upload campaign image') {
        errorMessage = 'Failed to upload campaign image. Please try with a different image or create campaign without image.';
      } else if (error?.response?.data?.message) {

        errorMessage = error.response.data.message;
      }
      
      showAlert({
        title: 'Creation Failed',
        message: errorMessage,
        type: 'error',
        buttonText: 'OK'
      });
    } finally {
      setCreating(false);
    }
  }, [parsedBannerData, parsedFeeInfo, showAlert, router, selectedImage]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);


  if (!parsedBannerData || !bannerCardData || !bannerDetailData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.GRAY_LIGHT} />
          <Text style={[styles.errorTitle, { fontSize: titleFontSize }]}>
            No Campaign Data
          </Text>
          <Text style={[styles.errorText, { fontSize: bodyFontSize }]}>
            Please go back and complete the campaign form.
          </Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Image 
            source={require('../../../assets/images/backB.png')}
            style={styles.backIcon} />
            
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { fontSize: titleFontSize }]}>
            Campaign Preview
          </Text>
        </View>
        
        <View style={styles.headerSpacer} />
      </View>


      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        

        <View style={styles.previewSection}>
          <Text style={[styles.previewTitle, { fontSize: sectionTitleFontSize }]}>
            In Donor Feed
          </Text>
          <Text style={[styles.previewSubtitle, { fontSize: bodyFontSize }]}>
            This small card appears between pet listings
          </Text>
          
          <View style={styles.cardContainer}>
            <BannerCard 
              item={bannerCardData}
              width={cardWidth}
              height={cardHeight}
              onPress={() => {}} 
            />
          </View>
        </View>

        <View style={styles.previewSection}>
          <Text style={[styles.previewTitle, { fontSize: sectionTitleFontSize }]}>
            Campaign Photo (Optional)
          </Text>
          <Text style={[styles.previewSubtitle, { fontSize: bodyFontSize }]}>
            Add a photo to make your campaign more engaging
          </Text>
          
          <TouchableOpacity
            style={styles.imageUploadContainer}
            onPress={handleImageSelection}
            activeOpacity={0.7}
          >
            {selectedImage ? (
              <Image source={{ uri: selectedImage.uri }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color={COLORS.GRAY_DARK} />
                <Text style={styles.imageUploadText}>Tap to select image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

     
        <View style={styles.previewSection}>
          <Text style={[styles.previewTitle, { fontSize: sectionTitleFontSize }]}>
            Detail View
          </Text>
          <Text style={[styles.previewSubtitle, { fontSize: bodyFontSize }]}>
            This detailed view appears when donors click on your campaign
          </Text>
          
          <View style={styles.cardContainer}>
            <BannerDetailCard 
              campaign={bannerDetailData}
            />
          </View>
        </View>

        <View style={styles.summarySection}>
          <Text style={[styles.summaryTitle, { fontSize: sectionTitleFontSize }]}>
            Campaign Summary
          </Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { fontSize: bodyFontSize }]}>Target Amount</Text>
              <Text style={[styles.summaryValue, { fontSize: bodyFontSize }]}>
                ${parseFloat(parsedBannerData.targetAmount).toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { fontSize: bodyFontSize }]}>Duration</Text>
              <Text style={[styles.summaryValue, { fontSize: bodyFontSize }]}>
                {parsedBannerData.duration === 1 ? '1 Week' : 
                 parsedBannerData.duration === 4 ? '1 Month' : 
                 `${parsedBannerData.duration} Weeks`}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { fontSize: bodyFontSize }]}>Priority Level</Text>
              <Text style={[styles.summaryValue, { fontSize: bodyFontSize }]}>
                {parsedBannerData.urgencyLevel.charAt(0).toUpperCase() + parsedBannerData.urgencyLevel.slice(1)}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { fontSize: bodyFontSize }]}>Platform Fee</Text>
              <Text style={[styles.summaryValue, { fontSize: bodyFontSize }]}>
                {parsedFeeInfo?.percentage.toFixed(1)}%
              </Text>
            </View>
          </View>

          <View style={styles.financialBreakdown}>
            <View style={styles.financialRow}>
              <Text style={[styles.financialLabel, { fontSize: bodyFontSize }]}>
                Campaign Target:
              </Text>
              <Text style={[styles.financialValue, { fontSize: bodyFontSize }]}>
                ${parseFloat(parsedBannerData.targetAmount).toLocaleString()}
              </Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={[styles.financialLabel, { fontSize: bodyFontSize }]}>
                Platform Fee:
              </Text>
              <Text style={[styles.financialValue, { fontSize: bodyFontSize }]}>
                -${parsedFeeInfo?.amount.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.financialRow, styles.netRow]}>
              <Text style={[styles.netLabel, { fontSize: bodyFontSize }]}>
                You Receive:
              </Text>
              <Text style={[styles.netValue, { fontSize: titleFontSize }]}>
                ${parsedFeeInfo?.net.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createButton, creating && styles.createButtonDisabled]}
          onPress={handleCreateCampaign}
          activeOpacity={0.8}
          disabled={creating}
        >
          <Text style={[styles.createButtonText, { fontSize: bodyFontSize }]}>
            {creating ? 'Creating Campaign...' : 'Create Campaign'}
          </Text>
        </TouchableOpacity>

        <View style={styles.disclaimerSection}>
          <Text style={[styles.disclaimerText, { fontSize: bodyFontSize * 0.9 }]}>
            By creating this campaign, you agree to our terms of service. 
            The platform fee helps us maintain the app and connect more shelters with donors. 
            You can track your campaign progress and manage it from your profile.
          </Text>
        </View>
        <View style={styles.bottomSpace} />
      </ScrollView>

      <AlertModal
        visible={isVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttonText={alertConfig.buttonText}
        type={alertConfig.type}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  
  header: {
    height: DESIGN_CONSTANTS.HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingBottom: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
  },
  backButton: {
    padding: SPACING.SMALL,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: COLORS.GRAY_DARK,
    resizeMode: 'contain',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },
  headerSpacer: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: SPACING.EXTRA_LARGE,
    paddingBottom: SPACING.HUGE,
  },
  
  previewSection: {
    marginBottom: SPACING.EXTRA_LARGE,
  },
  previewTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.SMALL,
  },
  previewSubtitle: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginBottom: SPACING.LARGE,
    lineHeight: 18,
  },
  cardContainer: {
    alignItems: 'center',
  },
  
  imageUploadContainer: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: SPACING.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.INPUT_BORDER,
    borderStyle: 'dashed',
    padding: SPACING.EXTRA_LARGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imageUploadText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginTop: SPACING.SMALL,
  },
  uploadedImage: {
    width: 200,
    height: 112, 
    borderRadius: SPACING.MEDIUM,
  },

  summarySection: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.EXTRA_LARGE,
    marginBottom: SPACING.EXTRA_LARGE,
  },
  summaryTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.LARGE,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.LARGE,
  },
  summaryItem: {
    width: '48%',
    marginBottom: SPACING.MEDIUM,
  },
  summaryLabel: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginBottom: SPACING.TINY,
  },
  summaryValue: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },
  
  financialBreakdown: {
    borderTopWidth: 1,
    borderTopColor: COLORS.INPUT_BORDER,
    paddingTop: SPACING.LARGE,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.SMALL,
  },
  financialLabel: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
  },
  financialValue: {
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.PRIMARY_BROWN,
  },
  netRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.INPUT_BORDER,
    paddingTop: SPACING.MEDIUM,
    marginTop: SPACING.SMALL,
  },
  netLabel: {
    fontFamily: 'PoppinsBold',
    color: COLORS.SUCCESS_GREEN,
  },
  netValue: {
    fontFamily: 'PoppinsBold',
    color: COLORS.SUCCESS_GREEN,
  },

  createButton: {
    backgroundColor: COLORS.LIGHT_BROWN,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    paddingVertical: SPACING.LARGE,
    alignItems: 'center',
    marginBottom: SPACING.EXTRA_LARGE,
  },
  createButtonDisabled: {
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  createButtonText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.CARD_BACKGROUND,
  },
  
  disclaimerSection: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.LARGE,
    marginBottom: SPACING.LARGE,
  },
  disclaimerText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    lineHeight: 18,
    textAlign: 'center',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.EXTRA_LARGE,
  },
  errorTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginTop: SPACING.LARGE,
    marginBottom: SPACING.MEDIUM,
  },
  errorText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.EXTRA_LARGE,
  },
  errorButton: {
    backgroundColor: COLORS.LIGHT_BROWN,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    paddingHorizontal: SPACING.EXTRA_LARGE,
    paddingVertical: SPACING.LARGE,
  },
  errorButtonText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.CARD_BACKGROUND,
  },
  
  bottomSpace: {
    height: 140,
  },
});

export default BannerPreviewPage;