
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AlertModal } from '../../components/modals';
import { useAlertModal } from '../../hooks/useAlertModal';
import axios from 'axios';
import { API_BASE_URL } from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditPetInfoModal from '../../components/modals/EditPetInfoModal';
import MonthlyGoalsModal from '../../components/modals/MonthlyGoalModal';
import GalleryManagementModal from '../../components/modals/GalleryManagementModal';
import AdoptionConfirmationModal from '../../components/modals/AdoptionConfirmationModal';
import RemovePetModal from '../../components/modals/RemovePetModal';


const DESIGN_CONSTANTS = {
  HORIZONTAL_PADDING: 20,
  BORDER_RADIUS: 15,
  CARD_SPACING: 16,
  BUTTON_HEIGHT: 50,
  BACK_BUTTON_TOP: 50,
  PROGRESS_BAR_HEIGHT: 25,
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
  DONATE_ORANGE: '#FF8C42',
  SUCCESS_GREEN: '#51CF66',
  ERROR_RED: '#FF6B6B',
  WARNING_YELLOW: '#FFD43B',
  GRAY_DARK: '#797979',
  GRAY_LIGHT: '#D6C0B3',
  PROGRESS_RED: '#FF6B6B',
  PROGRESS_YELLOW: '#FFD43B', 
  PROGRESS_GREEN: '#51CF66',
};

const FONT_RATIOS = {
  HEADER_TITLE: 0.055,
  SECTION_TITLE: 0.045,
  PET_NAME: 0.065,
  BODY_TEXT: 0.035,
  LABEL_TEXT: 0.032,
  BUTTON_TEXT: 0.042,
} as const;


interface PetData {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  type: string;
  description: string;
  story: string;
  adoptionFee: number;
  mainImage: any;
  galleryImages: any[];
  status: 'draft' | 'published' | 'adopted' | 'removed';
  publishedAt: string | null;
  isPublished: boolean;
  monthlyGoal: {
    vaccination: number;
    food: number;
    medical: number;
    other: number;
    total: number;
  };
  currentFunding: {
    vaccination: number;
    food: number;
    medical: number;
    other: number;
    total: number;
  };
  medicalInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
  };
  lastGoalUpdate: string;
  daysUntilCanUpdate: number;
  adoptionRequests: Array<{
    id: string;
    userEmail: string;
    userName: string;
    userPhone?: string;
    userProfileImage?: string;
    status: 'pending' | 'approved' | 'denied' | 'cancelled';
    message?: string;
    pawPointsUsedForReduction: number;
    feeReduction: number;
    createdAt: string;
    expiresAt: string;
    isExpired: boolean;
    userPawPoints?: number;
    userDonationAmount?: number;
  }>;
  totalDonated: number;
}

const ShelterPetManagePage = () => {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isVisible, alertConfig, showAlert, hideAlert } = useAlertModal();

  const [petData, setPetData] = useState<PetData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPet = async () => {
      setFetchError(null);
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const res = await axios.get(`${API_BASE_URL}/pets/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const pet = res.data;
    
        setPetData({
          id: pet.id,
          name: pet.name || '',
          breed: pet.breed || '',
          age: pet.age ? `${pet.age} years` : '',
          gender: pet.gender === 'male' ? 'Male' : 'Female',
          type: pet.type === 'dog' ? 'Dog' : pet.type === 'cat' ? 'Cat' : pet.type || '',
          description: pet.description || '',
          story: pet.story || '',
          adoptionFee: pet.adoptionFee ?? 0,
          mainImage: pet.mainImage ? { uri: pet.mainImage } : require('../../assets/images/placeholder.png'),
          galleryImages: pet.additionalImages?.length ? pet.additionalImages.map((img: string) => ({ uri: img })) : [],
          status: pet.status || 'draft',
          publishedAt: pet.publishedAt ?? null,
          isPublished: pet.status === 'published',
          monthlyGoal: {
            vaccination: pet.monthlyGoals?.vaccination || 0,
            food: pet.monthlyGoals?.food || 0,
            medical: pet.monthlyGoals?.medical || 0,
            other: pet.monthlyGoals?.other || 0,
            total: pet.totalMonthlyGoal || 0,
          },
          currentFunding: {
            vaccination: pet.currentMonthDistribution?.vaccination || 0,
            food: pet.currentMonthDistribution?.food || 0,
            medical: pet.currentMonthDistribution?.medical || 0,
            other: pet.currentMonthDistribution?.other || 0,
            total: pet.currentMonthDonations || 0,
          },
          medicalInfo: {
            vaccinated: pet.vaccinated ?? false,
            spayedNeutered: pet.spayedNeutered ?? false,
            microchipped: !!pet.microchipNumber,
          },
          lastGoalUpdate: pet.goalsLastReset ?? '',
          daysUntilCanUpdate: pet.daysUntilGoalsReset ?? 0,
          adoptionRequests: [], // Will be fetched separately
          totalDonated: parseFloat(pet.currentMonthDonations) || 0,
        });
        
      } catch (err: any) {
        setFetchError('Failed to load pet details. Please try again.');
      }
    };

    fetchPet();
  }, [params.id]);

  useEffect(() => {
    const fetchAdoptionRequests = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        
        const res = await axios.get(`${API_BASE_URL}/adoptions/shelter-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const petRequests = res.data
          .filter((req: any) => req.petId === params.id && req.status === 'pending')
          .map((req: any) => ({
            id: req.id,
            userEmail: req.user?.email ?? 'Email not available',
            userName: req.user?.name ?? 'Name not available',
            userPhone: req.user?.phone ?? 'Phone not available',
            userProfileImage: req.user?.profileImage,
            status: req.status,
            message: req.message,
            pawPointsUsedForReduction: req.pawPointsUsedForReduction,
            feeReduction: req.feeReduction,
            createdAt: req.createdAt,
            expiresAt: req.expiresAt,
            isExpired: req.isExpired,
            userPawPoints: req.user?.pawPoints ?? 0,
            userDonationAmount: 0, 
          }));
        
        setPetData((prev) => prev ? { ...prev, adoptionRequests: petRequests } : null);
      } catch (err) {
   
      }
    };
    
    if (params.id && petData) fetchAdoptionRequests();
  }, [params.id, petData?.id]); 


  const refreshPetData = useCallback(async () => {
    setFetchError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      const res = await axios.get(`${API_BASE_URL}/pets/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pet = res.data;
      
      
      setPetData({
        id: pet.id,
        name: pet.name || '',
        breed: pet.breed || '',
        age: pet.age ? `${pet.age} years` : '',
        gender: pet.gender === 'male' ? 'Male' : 'Female',
        type: pet.type === 'dog' ? 'Dog' : pet.type === 'cat' ? 'Cat' : pet.type || '',
        description: pet.description || '',
        story: pet.story || '',
        adoptionFee: pet.adoptionFee ?? 0,
        mainImage: pet.mainImage ? { uri: pet.mainImage } : require('../../assets/images/placeholder.png'),
        galleryImages: pet.additionalImages?.length ? pet.additionalImages.map((img: string) => ({ uri: img })) : [],
        status: pet.status || 'draft',
        publishedAt: pet.publishedAt ?? null,
        isPublished: pet.status === 'published',
        monthlyGoal: {
          vaccination: pet.monthlyGoals?.vaccination || 0,
          food: pet.monthlyGoals?.food || 0,
          medical: pet.monthlyGoals?.medical || 0,
          other: pet.monthlyGoals?.other || 0,
          total: pet.totalMonthlyGoal || 0,
        },
        currentFunding: {
          vaccination: pet.currentMonthDistribution?.vaccination || 0,
          food: pet.currentMonthDistribution?.food || 0,
          medical: pet.currentMonthDistribution?.medical || 0,
          other: pet.currentMonthDistribution?.other || 0,
          total: pet.currentMonthDonations || 0,
        },
        medicalInfo: {
          vaccinated: pet.vaccinated ?? false,
          spayedNeutered: pet.spayedNeutered ?? false,
          microchipped: !!pet.microchipNumber,
        },
        lastGoalUpdate: pet.goalsLastReset ?? '',
        daysUntilCanUpdate: pet.daysUntilGoalsReset ?? 0,
        adoptionRequests: [], 
        totalDonated: parseFloat(pet.currentMonthDonations) || 0,
      });
      
    } catch (err: any) {
      setFetchError('Failed to load pet details. Please try again.');
    }
  }, [params.id]);

  const refreshAdoptionRequests = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      

      const res = await axios.get(`${API_BASE_URL}/adoptions/shelter-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      
      const petRequests = res.data
        .filter((req: any) => req.petId === params.id && req.status === 'pending')
        .map((req: any) => ({
          id: req.id,
          userEmail: req.user?.email ?? 'Email not available',
          userName: req.user?.name ?? 'Name not available',
          userPhone: req.user?.phone ?? 'Phone not available',
          userProfileImage: req.user?.profileImage, 
          status: req.status,
          message: req.message,
          pawPointsUsedForReduction: req.pawPointsUsedForReduction,
          feeReduction: req.feeReduction,
          createdAt: req.createdAt,
          expiresAt: req.expiresAt,
          isExpired: req.isExpired,
          userPawPoints: req.user?.pawPoints ?? 0,
          userDonationAmount: 0, 
        }));
      
      setPetData((prev) => prev ? { ...prev, adoptionRequests: petRequests } : null);
    } catch (err) {

    }
  }, [params.id]);


  const [activeModal, setActiveModal] = useState<'none' | 'edit' | 'goals' | 'gallery' | 'adoption' | 'removal'>('none');
  const [isLoading, setIsLoading] = useState(false);

  const [editFormData, setEditFormData] = useState({
    name: '',
    breed: '',
    age: '',
    gender: 'Male',
    category: '',
    vaccinated: false,
    spayedNeutered: false,
    adoptionFee: '',
    description: '',
    story: '',
  });

  const [goalFormData, setGoalFormData] = useState({
    vaccination: 0,
    food: 0,
    medical: 0,
    other: 0,
    total: 0,
  });

  const [galleryData, setGalleryData] = useState<{
    mainImage: any;
    galleryImages: any[];
  }>({
    mainImage: require('../../assets/images/placeholder.png'),
    galleryImages: [],
  });


  useEffect(() => {
    if (petData) {
      console.log('🔍 FRONTEND MODAL: Updating form states with petData:', {
        name: petData.name,
        breed: petData.breed,
        description: petData.description,
        story: petData.story,
        monthlyGoal: petData.monthlyGoal
      });
      
      setEditFormData({
        name: petData.name || '',
        breed: petData.breed || '',
        age: petData.age || '',
        gender: (petData.gender as 'Male' | 'Female') || 'Male',
        category: petData.type.toLowerCase() || '',
        vaccinated: petData.medicalInfo.vaccinated || false,
        spayedNeutered: petData.medicalInfo.spayedNeutered || false,
        adoptionFee: petData.adoptionFee.toString() || '',
        description: petData.description || '',
        story: petData.story || '',
      });

      setGoalFormData({
        vaccination: petData.monthlyGoal?.vaccination || 0,
        food: petData.monthlyGoal?.food || 0,
        medical: petData.monthlyGoal?.medical || 0,
        other: petData.monthlyGoal?.other || 0,
        total: petData.monthlyGoal?.total || 0,
      });

      setGalleryData({
        mainImage: petData.mainImage || require('../../assets/images/placeholder.png'),
        galleryImages: petData.galleryImages || [],
      });
      
      console.log('🔍 FRONTEND MODAL: Form states updated:', {
        editFormData: {
          name: petData.name,
          breed: petData.breed,
          description: petData.description,
          story: petData.story
        },
        goalFormData: {
          vaccination: petData.monthlyGoal?.vaccination,
          food: petData.monthlyGoal?.food,
          medical: petData.monthlyGoal?.medical,
          other: petData.monthlyGoal?.other
        }
      });
    }
  }, [petData]); 


  const headerTitleFontSize = width * FONT_RATIOS.HEADER_TITLE;
  const sectionTitleFontSize = width * FONT_RATIOS.SECTION_TITLE;
  const petNameFontSize = width * FONT_RATIOS.PET_NAME;
  const bodyTextFontSize = width * FONT_RATIOS.BODY_TEXT;
  const labelTextFontSize = width * FONT_RATIOS.LABEL_TEXT;
  const buttonTextFontSize = width * FONT_RATIOS.BUTTON_TEXT;

  const handleApproveRequest = useCallback(async (requestId: string) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      await axios.put(`${API_BASE_URL}/adoptions/${requestId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      showAlert({
        title: 'Request Approved',
        message: 'The adoption request has been approved successfully! A success story will be created.',
        type: 'success',
        buttonText: 'OK',
      });
      
              // Refresh adoption requests and pet data
        if (params.id && petData) {
          const res = await axios.get(`${API_BASE_URL}/adoptions/shelter-requests`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const petRequests = res.data
            .filter((req: any) => req.petId === params.id && req.status === 'pending')
            .map((req: any) => ({
              id: req.id,
              userEmail: req.user?.email ?? 'Email not available',
              userName: req.user?.name ?? 'Name not available',
              userPhone: req.user?.phone ?? 'Phone not available',
              userProfileImage: req.user?.profileImage,
              status: req.status,
              message: req.message,
              pawPointsUsedForReduction: req.pawPointsUsedForReduction,
              feeReduction: req.feeReduction,
              createdAt: req.createdAt,
              expiresAt: req.expiresAt,
              isExpired: req.isExpired,
              userPawPoints: req.user?.pawPoints ?? 0,
              userDonationAmount: 0,
            }));
          
          setPetData(prev => prev ? { ...prev, adoptionRequests: petRequests } : null);
        }
      
    } catch (error: any) {
      showAlert({
        title: 'Approval Failed',
        message: error?.response?.data?.message || 'Failed to approve adoption request. Please try again.',
        type: 'error',
        buttonText: 'OK',
      });
    } finally {
      setIsLoading(false);
    }
  }, [petData, params.id, showAlert]);

  const handleDeclineRequest = useCallback(async (requestId: string, reason?: string) => {
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      await axios.put(`${API_BASE_URL}/adoptions/${requestId}/deny`, {
        statusReason: reason || 'Request declined by shelter',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      showAlert({
        title: 'Request Declined',
        message: 'The adoption request has been declined. The user\'s PawPoints have been refunded.',
        type: 'info',
        buttonText: 'OK',
      });
      
           
        if (params.id && petData) {
          const res = await axios.get(`${API_BASE_URL}/adoptions/shelter-requests`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const petRequests = res.data
            .filter((req: any) => req.petId === params.id && req.status === 'pending')
            .map((req: any) => ({
              id: req.id,
              userEmail: req.user?.email ?? 'Email not available',
              userName: req.user?.name ?? 'Name not available',
              userPhone: req.user?.phone ?? 'Phone not available',
              userProfileImage: req.user?.profileImage,
              status: req.status,
              message: req.message,
              pawPointsUsedForReduction: req.pawPointsUsedForReduction,
              feeReduction: req.feeReduction,
              createdAt: req.createdAt,
              expiresAt: req.expiresAt,
              isExpired: req.isExpired,
              userPawPoints: req.user?.pawPoints ?? 0,
              userDonationAmount: 0,
            }));
          
          setPetData(prev => prev ? { ...prev, adoptionRequests: petRequests } : null);
        }
      
    } catch (error: any) {
      showAlert({
        title: 'Decline Failed',
        message: error?.response?.data?.message || 'Failed to decline adoption request. Please try again.',
        type: 'error',
        buttonText: 'OK',
      });
    } finally {
      setIsLoading(false);
    }
  }, [petData, params.id, showAlert]);


  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return COLORS.PROGRESS_GREEN;
    if (percentage >= 50) return COLORS.WARNING_YELLOW;
    return COLORS.PROGRESS_RED;
  };

  const getFundingPercentage = (current: number, target: number): number => {
    if (target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };


  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleEditInfo = useCallback(() => {
    if (!petData?.isPublished) {
      setActiveModal('edit');
    } else {
      showAlert({
        title: 'Pet Already Published',
        message: 'This pet is already published and visible to donors. Pet details cannot be edited after publishing to maintain trust with donors.',
        type: 'warning',
        buttonText: 'OK',
      });
      
    }
  }, [petData?.isPublished, showAlert]);

  const handleUpdateGoals = useCallback(() => {
    if (petData?.daysUntilCanUpdate > 0) {
      showAlert({
        title: 'Goals Recently Updated',
        message: `Monthly goals can only be updated once every 31 days. You can update again in ${petData.daysUntilCanUpdate} days.`,
        type: 'warning',
        buttonText: 'OK',
      });
      return;
    }
    setActiveModal('goals');
  }, [petData?.daysUntilCanUpdate, showAlert]);

  const handleManagePhotos = useCallback(() => {
    console.log('GALLERY MODAL: Opening gallery modal with data:', {
      mainImage: galleryData.mainImage,
      galleryImages: galleryData.galleryImages,
      petDataMainImage: petData?.mainImage,
      petDataGalleryImages: petData?.galleryImages
    });
    setActiveModal('gallery');
  }, [galleryData, petData]);

  const handleMarkAdopted = useCallback(() => {
    setActiveModal('adoption');
  }, []);

  const handleRemovePet = useCallback(() => {
    setActiveModal('removal');
  }, []);

  const handlePublishPet = useCallback(async () => {
    if (!petData) return;
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      await axios.post(`${API_BASE_URL}/pets/${petData.id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showAlert({
        title: 'Pet Published!',
        message: 'Your pet is now live and visible to donors.',
        type: 'success',
        buttonText: 'OK',
      });
      
      const res = await axios.get(`${API_BASE_URL}/pets/${petData.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pet = res.data;
      setPetData((prev) => prev ? {
        ...prev,
        status: pet.status,
        isPublished: pet.status === 'published',
        publishedAt: pet.publishedAt ?? null,
      } : prev);
    } catch (err: any) {
      showAlert({
        title: 'Publish Failed',
        message: err?.response?.data?.message || 'Failed to publish pet. Please check requirements and try again.',
        type: 'error',
        buttonText: 'OK',
      });
    } finally {
      setIsLoading(false);
    }
  }, [petData, showAlert]);

  const handleSaveEditInfo = useCallback(async (data: any) => {
    if (!petData) return;
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      await axios.put(`${API_BASE_URL}/pets/${petData.id}`, {
        name: data.name,
        breed: data.breed,
        age: data.age,
        gender: data.gender.toLowerCase(),
        type: data.category,
        adoptionFee: Number(data.adoptionFee),
        description: data.description,
        story: data.story,
        vaccinated: data.vaccinated,
        spayedNeutered: data.spayedNeutered,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showAlert({
        title: 'Pet Updated',
        message: 'Pet information has been successfully updated.',
        type: 'success',
        buttonText: 'OK',
      });

      const res = await axios.get(`${API_BASE_URL}/pets/${petData.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pet = res.data;
      

      setPetData({
        id: pet.id,
        name: pet.name || '',
        breed: pet.breed || '',
        age: pet.age ? `${pet.age} years` : '',
        gender: pet.gender === 'male' ? 'Male' : 'Female',
        type: pet.type === 'dog' ? 'Dog' : pet.type === 'cat' ? 'Cat' : pet.type || '',
        description: pet.description || '',
        story: pet.story || '',
        adoptionFee: pet.adoptionFee ?? 0,
        mainImage: pet.mainImage ? { uri: pet.mainImage } : require('../../assets/images/placeholder.png'),
        galleryImages: pet.additionalImages?.length ? pet.additionalImages.map((img: string) => ({ uri: img })) : [],
        status: pet.status || 'draft',
        publishedAt: pet.publishedAt ?? null,
        isPublished: pet.status === 'published',
        monthlyGoal: {
          vaccination: pet.monthlyGoals?.vaccination || 0,
          food: pet.monthlyGoals?.food || 0,
          medical: pet.monthlyGoals?.medical || 0,
          other: pet.monthlyGoals?.other || 0,
          total: pet.totalMonthlyGoal || 0,
        },
        currentFunding: {
          vaccination: pet.currentMonthDistribution?.vaccination || 0,
          food: pet.currentMonthDistribution?.food || 0,
          medical: pet.currentMonthDistribution?.medical || 0,
          other: pet.currentMonthDistribution?.other || 0,
          total: pet.currentMonthDonations || 0,
        },
        medicalInfo: {
          vaccinated: pet.vaccinated ?? false,
          spayedNeutered: pet.spayedNeutered ?? false,
          microchipped: !!pet.microchipNumber,
        },
        lastGoalUpdate: pet.goalsLastReset ?? '',
        daysUntilCanUpdate: pet.daysUntilGoalsReset ?? 0,
        adoptionRequests: pet.adoptionRequests?.map((req: any) => ({
          id: req.id,
          userEmail: req.user?.email ?? '',
          userName: req.user?.name ?? '',
          userPhone: req.user?.phone ?? '',
        })) ?? [],
        totalDonated: parseFloat(pet.currentMonthDonations) || 0,
      });
      
      setActiveModal('none');
    } catch (error: any) {
      showAlert({
        title: 'Update Failed',
        message: error?.response?.data?.message || 'Failed to update pet information. Please try again.',
        type: 'error',
        buttonText: 'OK',
      });
    } finally {
      setIsLoading(false);
    }
  }, [petData, showAlert]);

  const handleSaveGoals = useCallback(async (data: any) => {
    if (!petData) return;
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      await axios.post(`${API_BASE_URL}/pets/${petData.id}/goals`, {
        vaccination: data.vaccination,
        food: data.food,
        medical: data.medical,
        other: data.other,
        total: data.total,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showAlert({
        title: 'Goals Updated',
        message: 'Monthly care goals have been updated successfully.',
        type: 'success',
        buttonText: 'OK',
      });

      const res = await axios.get(`${API_BASE_URL}/pets/${petData.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pet = res.data;
      
      setPetData({
        id: pet.id,
        name: pet.name || '',
        breed: pet.breed || '',
        age: pet.age ? `${pet.age} years` : '',
        gender: pet.gender === 'male' ? 'Male' : 'Female',
        type: pet.type === 'dog' ? 'Dog' : pet.type === 'cat' ? 'Cat' : pet.type || '',
        description: pet.description || '',
        story: pet.story || '',
        adoptionFee: pet.adoptionFee ?? 0,
        mainImage: pet.mainImage ? { uri: pet.mainImage } : require('../../assets/images/placeholder.png'),
        galleryImages: pet.additionalImages?.length ? pet.additionalImages.map((img: string) => ({ uri: img })) : [],
        status: pet.status || 'draft',
        publishedAt: pet.publishedAt ?? null,
        isPublished: pet.status === 'published',
        monthlyGoal: {
          vaccination: pet.monthlyGoals?.vaccination || 0,
          food: pet.monthlyGoals?.food || 0,
          medical: pet.monthlyGoals?.medical || 0,
          other: pet.monthlyGoals?.other || 0,
          total: pet.totalMonthlyGoal || 0,
        },
        currentFunding: {
          vaccination: pet.currentMonthDistribution?.vaccination || 0,
          food: pet.currentMonthDistribution?.food || 0,
          medical: pet.currentMonthDistribution?.medical || 0,
          other: pet.currentMonthDistribution?.other || 0,
          total: pet.currentMonthDonations || 0,
        },
        medicalInfo: {
          vaccinated: pet.vaccinated ?? false,
          spayedNeutered: pet.spayedNeutered ?? false,
          microchipped: !!pet.microchipNumber,
        },
        lastGoalUpdate: pet.goalsLastReset ?? '',
        daysUntilCanUpdate: pet.daysUntilGoalsReset ?? 0,
        adoptionRequests: pet.adoptionRequests?.map((req: any) => ({
          id: req.id,
          userEmail: req.user?.email ?? '',
          userName: req.user?.name ?? '',
          userPhone: req.user?.phone ?? '',
        })) ?? [],
        totalDonated: parseFloat(pet.currentMonthDonations) || 0,
      });
      
      setActiveModal('none');
    } catch (error: any) {
      showAlert({
        title: 'Update Failed',
        message: error?.response?.data?.message || 'Failed to update monthly goals. Please try again.',
        type: 'error',
        buttonText: 'OK',
      });
    } finally {
      setIsLoading(false);
    }
  }, [petData, showAlert]);

  const handleSaveGallery = useCallback(async (data: any) => {
    if (!petData) return;
    setIsLoading(true);
    
    console.log('GALLERY SAVE: Received data:', data);
    
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      
      let mainImageUpdated = false;
      let additionalImagesUpdated = false;
      
      
      if (data.mainImage && data.mainImage.base64) {
        console.log('GALLERY SAVE: Uploading new main image with base64');
        
        const uploadResponse = await fetch(`${API_BASE_URL}/pets/${petData.id}/images/main-base64`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: data.mainImage.base64
          }),
        });
        
        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          throw new Error(`Main image upload failed: ${errorText}`);
        }
        
        mainImageUpdated = true;
                  console.log('GALLERY SAVE: Main image uploaded successfully');
      }
      

      if (data.galleryImages && data.galleryImages.length > 0) {
        const newImages = data.galleryImages.filter((img: any) => img.base64);
        
        if (newImages.length > 0) {
          console.log(`GALLERY SAVE: Uploading ${newImages.length} new additional images`);
          
          const base64Images = newImages.map((img: any) => img.base64);
          
          const uploadResponse = await fetch(`${API_BASE_URL}/pets/${petData.id}/images/additional-base64`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              images: base64Images
            }),
          });
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            throw new Error(`Additional images upload failed: ${errorText}`);
          }
          
          additionalImagesUpdated = true;
          console.log('GALLERY SAVE: Additional images uploaded successfully');
        }
      }
      
      if (mainImageUpdated || additionalImagesUpdated) {
        showAlert({
          title: 'Photos Updated',
          message: 'Pet photos have been updated successfully.',
          type: 'success',
          buttonText: 'OK',
        });
        
  
        const res = await axios.get(`${API_BASE_URL}/pets/${petData.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const pet = res.data;
        
        console.log('GALLERY SAVE: Refreshed pet data:', pet);
        

        setPetData({
          id: pet.id,
          name: pet.name || '',
          breed: pet.breed || '',
          age: pet.age ? `${pet.age} years` : '',
          gender: pet.gender === 'male' ? 'Male' : 'Female',
          type: pet.type === 'dog' ? 'Dog' : pet.type === 'cat' ? 'Cat' : pet.type || '',
          description: pet.description || '',
          story: pet.story || '',
          adoptionFee: pet.adoptionFee ?? 0,
          mainImage: pet.mainImage ? { uri: pet.mainImage } : require('../../assets/images/placeholder.png'),
          galleryImages: pet.additionalImages?.length ? pet.additionalImages.map((img: string) => ({ uri: img })) : [],
          status: pet.status || 'draft',
          publishedAt: pet.publishedAt ?? null,
          isPublished: pet.status === 'published',
          monthlyGoal: {
            vaccination: pet.monthlyGoals?.vaccination || 0,
            food: pet.monthlyGoals?.food || 0,
            medical: pet.monthlyGoals?.medical || 0,
            other: pet.monthlyGoals?.other || 0,
            total: pet.totalMonthlyGoal || 0,
          },
          currentFunding: {
            vaccination: pet.currentMonthDistribution?.vaccination || 0,
            food: pet.currentMonthDistribution?.food || 0,
            medical: pet.currentMonthDistribution?.medical || 0,
            other: pet.currentMonthDistribution?.other || 0,
            total: pet.currentMonthDonations || 0,
          },
          medicalInfo: {
            vaccinated: pet.vaccinated ?? false,
            spayedNeutered: pet.spayedNeutered ?? false,
            microchipped: !!pet.microchipNumber,
          },
          lastGoalUpdate: pet.goalsLastReset ?? '',
          daysUntilCanUpdate: pet.daysUntilGoalsReset ?? 0,
          adoptionRequests: pet.adoptionRequests?.map((req: any) => ({
            id: req.id,
            userEmail: req.user?.email ?? '',
            userName: req.user?.name ?? '',
            userPhone: req.user?.phone ?? '',
          })) ?? [],
          totalDonated: parseFloat(pet.currentMonthDonations) || 0,
        });
      } else {
        showAlert({
          title: 'No Changes',
          message: 'No new photos were selected to upload.',
          type: 'info',
          buttonText: 'OK',
        });
      }
      
      setActiveModal('none');
    } catch (error: any) {
              console.error('GALLERY SAVE ERROR:', error);
      showAlert({
        title: 'Update Failed',
        message: error?.message || 'Failed to update photos. Please try again.',
        type: 'error',
        buttonText: 'OK',
      });
    } finally {
      setIsLoading(false);
    }
  }, [petData, showAlert]);


  const handleConfirmAdoption = useCallback(async (data: any) => {
    if (!petData) return;
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      if (data.adoptionType === 'app' && data.selectedAdopterId) {

        await axios.put(`${API_BASE_URL}/adoptions/${data.selectedAdopterId}/approve`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (data.adoptionType === 'external') {
        
        await axios.patch(`${API_BASE_URL}/pets/${petData.id}`, {
          status: 'adopted'
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      showAlert({
        title: 'Adoption Confirmed',
        message: 'The adoption has been confirmed and donors will be notified.',
        type: 'success',
        buttonText: 'OK',
      });
      setActiveModal('none');
      
      await refreshPetData();
      await refreshAdoptionRequests();
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: err?.response?.data?.message || 'Failed to confirm adoption. Please try again.',
        type: 'error',
        buttonText: 'OK',
      });
    } finally {
      setIsLoading(false);
    }
  }, [petData, showAlert, refreshPetData, refreshAdoptionRequests]);


  const handleConfirmRemoval = useCallback(async (data: any) => {
    if (!petData) return;
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');
      await axios.delete(`${API_BASE_URL}/pets/${petData.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data,
      });
      showAlert({
        title: 'Pet Removed',
        message: `${petData.name} has been removed from the platform.`,
        type: 'success',
        buttonText: 'OK',
      });
      setActiveModal('none');
      setTimeout(() => router.back(), 2000);
    } catch (error) {
      showAlert({
        title: 'Removal Failed',
        message: 'Failed to remove pet. Please try again.',
        type: 'error',
        buttonText: 'OK',
      });
    } finally {
      setIsLoading(false);
    }
  }, [petData, router, showAlert]);

  const renderProgressBar = (
    category: string, 
    displayName: string,
    current: number, 
    target: number,
    percentage: number
  ) => (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressLabel, { fontSize: labelTextFontSize }]}>
          {displayName}
        </Text>
        <Text style={[styles.progressAmount, { fontSize: labelTextFontSize }]}>
          {formatCurrency(current)} / {formatCurrency(target)}
        </Text>
      </View>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressBarFill,
            { 
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: getProgressColor(percentage)
            }
          ]} 
        />
      </View>
      <Text style={[styles.progressPercentage, { fontSize: labelTextFontSize }]}>
        {percentage.toFixed(1)}% funded
      </Text>
    </View>
  );

  const pendingRequests = useMemo(() => {
    if (!petData?.adoptionRequests || !petData?.id) return [];
    
    return petData.adoptionRequests.filter(request => 
      request.petId === petData.id && request.status === 'pending'
    );
  }, [petData?.adoptionRequests, petData?.id]);

  if (fetchError) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.BACKGROUND }}>
        <Text style={{ color: 'red', textAlign: 'center', fontSize: 16 }}>{fetchError}</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24 }}>
          <Text style={{ color: COLORS.PRIMARY_BROWN, fontSize: 16 }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  if (!petData) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.BACKGROUND }}>
        <Text style={{ color: COLORS.PRIMARY_BROWN, fontSize: 16 }}>Loading pet details...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <Image 
            source={require('../../assets/images/backB.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { fontSize: headerTitleFontSize }]}>
          Pet Management
        </Text>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.petImageSection}>
          <Image
            source={petData.mainImage}
            style={styles.petImage}
          />
          <Text style={[styles.petName, { fontSize: petNameFontSize }]}>
            {petData.name.toUpperCase()}
          </Text>
        </View>


        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { fontSize: bodyTextFontSize }]}>
                {formatCurrency(petData.totalDonated)}
              </Text>
              <Text style={[styles.statLabel, { fontSize: labelTextFontSize }]}>
                Total Donations
              </Text>
            </View>
            
            
          </View>

          
        </View>


        <View style={styles.actionButtonsContainer}>
          <View style={styles.editButtonContainer}>
            <Text style={[styles.editStatusText, { fontSize: labelTextFontSize }]}>
              {petData.isPublished 
                ? 'Published - Limited editing available' 
                : 'Draft - Can edit all details'
              }
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEditInfo}
            >
              
              <Text style={[styles.actionButtonText, { fontSize: buttonTextFontSize }]}>
                Edit Details
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleManagePhotos}
          >
            
            <Text style={[styles.actionButtonText, { fontSize: buttonTextFontSize }]}>
              Manage Photos
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
            Monthly Care Cost
          </Text>
          <Text style={[styles.sectionSubtitle, { fontSize: labelTextFontSize }]}>
            Track funding progress for each care category
          </Text>

          <View style={styles.progressSection}>
            {renderProgressBar(
              'vaccination',
              'Vaccination & Deworming',
              petData.currentFunding.vaccination,
              petData.monthlyGoal.vaccination,
              getFundingPercentage(petData.currentFunding.vaccination, petData.monthlyGoal.vaccination)
            )}
            
            {renderProgressBar(
              'food',
              'Food & Nutrition',
              petData.currentFunding.food,
              petData.monthlyGoal.food,
              getFundingPercentage(petData.currentFunding.food, petData.monthlyGoal.food)
            )}
            
            {renderProgressBar(
              'medical',
              'Medical Care',
              petData.currentFunding.medical,
              petData.monthlyGoal.medical,
              getFundingPercentage(petData.currentFunding.medical, petData.monthlyGoal.medical)
            )}
            
            {renderProgressBar(
              'other',
              'Other Expenses',
              petData.currentFunding.other,
              petData.monthlyGoal.other,
              getFundingPercentage(petData.currentFunding.other, petData.monthlyGoal.other)
            )}
          </View>

          <View style={styles.totalProgressContainer}>
            <View style={styles.totalProgressHeader}>
              <Text style={[styles.totalProgressLabel, { fontSize: bodyTextFontSize }]}>
                Total Monthly Goal
              </Text>
              <Text style={[styles.totalProgressAmount, { fontSize: bodyTextFontSize }]}>
                {formatCurrency(petData.currentFunding.total)} / {formatCurrency(petData.monthlyGoal.total)}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressBarFill,
                  { 
                    width: `${Math.min(getFundingPercentage(petData.currentFunding.total, petData.monthlyGoal.total), 100)}%`,
                    backgroundColor: getProgressColor(getFundingPercentage(petData.currentFunding.total, petData.monthlyGoal.total))
                  }
                ]} 
              />
            </View>
          </View>

          <View style={styles.updateGoalsContainer}>
            <TouchableOpacity
              style={[
                styles.updateGoalsButton,
                petData.daysUntilCanUpdate > 0 && styles.updateGoalsButtonDisabled
              ]}
              onPress={handleUpdateGoals}
              disabled={petData.daysUntilCanUpdate > 0}
            >
              <Text style={[
                styles.updateGoalsButtonText,
                { fontSize: buttonTextFontSize },
                petData.daysUntilCanUpdate > 0 && styles.updateGoalsButtonTextDisabled
              ]}>
                {petData.daysUntilCanUpdate > 0 ? 'Goals Recently Updated' : 'Update Goals'}
              </Text>
            </TouchableOpacity>
            
            {petData.daysUntilCanUpdate > 0 && (
              <Text style={[styles.updateCounterText, { fontSize: labelTextFontSize }]}>
                Can update in {petData.daysUntilCanUpdate} days
              </Text>
            )}
          </View>
        </View>


        {petData.adoptionRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
              Adoption Requests ({petData.adoptionRequests.length})
            </Text>
            <Text style={[styles.sectionSubtitle, { fontSize: labelTextFontSize }]}>
              Review and respond to adoption requests
            </Text>
            
            {petData.adoptionRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.requestUserInfo}>
                    <View style={styles.requestUserRow}>
                      <View style={styles.userAvatarContainer}>
                        <Image
                          source={request.userProfileImage ? { uri: request.userProfileImage } : require('../../assets/images/placeholder.png')}
                          style={styles.userAvatar}
                        />
                      </View>
                      <View style={styles.userNameContainer}>
                        <Text style={[styles.requestUserName, { fontSize: bodyTextFontSize }]}>
                          {request.userName}
                        </Text>
                        <Text style={[styles.requestDate, { fontSize: labelTextFontSize }]}>
                          Requested on {formatDate(request.createdAt)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                <View style={styles.requestContactInfo}>
                  <Text style={[styles.requestContactText, { fontSize: labelTextFontSize }]}>
                    Email: {request.userEmail}
                  </Text>
                  {request.userPhone && request.userPhone !== 'Phone not available' && (
                    <Text style={[styles.requestContactText, { fontSize: labelTextFontSize }]}>
                      Phone: {request.userPhone}
                    </Text>
                  )}
                </View>

                {request.message && (
                  <View style={styles.requestMessageContainer}>
                    <Text style={[styles.requestMessageLabel, { fontSize: labelTextFontSize }]}>
                      Message:
                    </Text>
                    <Text style={[styles.requestMessage, { fontSize: labelTextFontSize }]}>
                      "{request.message}"
                    </Text>
                  </View>
                )}

                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.requestActionButton, styles.declineButton]}
                    onPress={() => handleDeclineRequest(request.id, 'Request declined by shelter')}
                    disabled={isLoading}
                  >
                    <Ionicons name="close-circle" size={20} color="#FFFFFF" />
                    <Text style={[styles.requestActionText, { fontSize: labelTextFontSize }]}>
                      Decline
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.requestNote, { fontSize: labelTextFontSize }]}>
                  You'll receive a detailed email with complete adopter information
                </Text>
              </View>
            ))}
          </View>
        )}


        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontSize: sectionTitleFontSize }]}>
            Pet Status Management
          </Text>
          
          
          {petData.status === 'draft' && (
            <TouchableOpacity
              style={[styles.managementButton, { backgroundColor: COLORS.SUCCESS_GREEN }]}
              onPress={handlePublishPet}
              disabled={isLoading}
            >
              <Ionicons name="checkmark-circle" size={20} color={COLORS.CARD_BACKGROUND} />
              <Text style={[styles.managementButtonText, { fontSize: buttonTextFontSize }]}>Publish Pet</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.managementButton, { backgroundColor: COLORS.PRIMARY_BROWN}]}
            onPress={handleMarkAdopted}
          >
            <Ionicons name="heart" size={20} color={COLORS.CARD_BACKGROUND} />
            <Text style={[styles.managementButtonText, { fontSize: buttonTextFontSize }]}>
              Mark as Adopted
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.managementButton, { backgroundColor: COLORS.ERROR_RED }]}
            onPress={handleRemovePet}
          >
            <Ionicons name="trash-outline" size={20} color={COLORS.CARD_BACKGROUND} />
            <Text style={[styles.managementButtonText, { fontSize: buttonTextFontSize }]}>
              Remove Pet
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>


      <EditPetInfoModal
        visible={activeModal === 'edit'}
        onClose={() => setActiveModal('none')}
        onSave={handleSaveEditInfo}
        initialData={editFormData}
        mode="edit"
        isLoading={isLoading}
      />

      <MonthlyGoalsModal
        visible={activeModal === 'goals'}
        onClose={() => setActiveModal('none')}
        onSave={handleSaveGoals}
        initialData={goalFormData}
        mode="update"
        petName={petData?.name || ''}
        isLoading={isLoading}
      />

      <GalleryManagementModal
        visible={activeModal === 'gallery'}
        onClose={() => setActiveModal('none')}
        onSave={handleSaveGallery}
        initialData={galleryData}
        mode="manage"
        petName={petData?.name || ''}
        isLoading={isLoading}
      />

      <AdoptionConfirmationModal
        visible={activeModal === 'adoption'}
        onClose={() => setActiveModal('none')}
        onConfirm={handleConfirmAdoption}
        petName={petData?.name || ''}
        adoptionRequests={petData?.adoptionRequests || []}
        isLoading={isLoading}
      />

      <RemovePetModal
        visible={activeModal === 'removal'}
        onClose={() => setActiveModal('none')}
        onConfirm={handleConfirmRemoval}
        petName={petData?.name || ''}
        totalDonated={petData?.totalDonated || 0}
        isLoading={isLoading}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingTop: DESIGN_CONSTANTS.BACK_BUTTON_TOP,
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
  headerTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  petImageSection: {
    alignItems: 'center',
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    paddingVertical: SPACING.LARGE,
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.CARD_BACKGROUND,
    marginBottom: SPACING.MEDIUM,
  },
  petName: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    textAlign: 'center',
  },
  statsContainer: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    marginBottom: SPACING.LARGE,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.MEDIUM,
    gap: SPACING.MEDIUM,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.CARD_BACKGROUND,
    padding: SPACING.MEDIUM,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statCardFull: {},
  statValue: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.TINY,
    textAlign: 'center',
  },
  statLabel: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    paddingHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    marginBottom: SPACING.LARGE,
    gap: SPACING.MEDIUM,
  },
  editButtonContainer: {
    gap: SPACING.SMALL,
  },
  editStatusText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.LIGHT_BROWN,
    paddingVertical: SPACING.MEDIUM,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    gap: SPACING.SMALL,
  },
  actionButtonText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.CARD_BACKGROUND,
  },
  section: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    marginHorizontal: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    marginBottom: DESIGN_CONSTANTS.CARD_SPACING,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: DESIGN_CONSTANTS.HORIZONTAL_PADDING,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionTitle: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.SMALL,
  },
  sectionSubtitle: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    marginBottom: SPACING.MEDIUM,
    lineHeight: 20,
  },
  progressSection: {
    gap: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
  },
  progressContainer: {
    gap: SPACING.SMALL,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.PRIMARY_BROWN,
  },
  progressAmount: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
  },
  progressBar: {
    height: DESIGN_CONSTANTS.PROGRESS_BAR_HEIGHT,
    backgroundColor: COLORS.GRAY_LIGHT,
    borderRadius: DESIGN_CONSTANTS.PROGRESS_BAR_HEIGHT / 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: DESIGN_CONSTANTS.PROGRESS_BAR_HEIGHT / 2,
  },
  progressPercentage: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
  },
  totalProgressContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.GRAY_LIGHT,
    paddingTop: SPACING.MEDIUM,
    marginBottom: SPACING.LARGE,
  },
  totalProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.SMALL,
  },
  totalProgressLabel: {
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.PRIMARY_BROWN,
  },
  totalProgressAmount: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
  },
  updateGoalsContainer: {
    alignItems: 'center',
    gap: SPACING.SMALL,
  },
  updateGoalsButton: {
    backgroundColor: COLORS. LIGHT_BROWN,
    paddingHorizontal: SPACING.EXTRA_LARGE,
    paddingVertical: SPACING.MEDIUM,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
  },
  updateGoalsButtonDisabled: {
    backgroundColor: COLORS.GRAY_LIGHT,
  },
  updateGoalsButtonText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.CARD_BACKGROUND,
  },
  updateGoalsButtonTextDisabled: {
    color: COLORS.GRAY_DARK,
  },
  updateCounterText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
    fontStyle: 'italic',
  },
  requestCard: {
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_BROWN,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.MEDIUM,
  },
  requestUserInfo: {
    flex: 1,
  },
  requestUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MEDIUM,
  },
  userAvatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.GRAY_LIGHT,
    overflow: 'hidden',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userNameContainer: {
    flex: 1,
  },
  requestUserName: {
    fontFamily: 'PoppinsBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.TINY,
  },
  requestDate: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
  },

  requestContactInfo: {
    gap: SPACING.TINY,
    marginBottom: SPACING.SMALL,
  },
  requestContactText: {
    fontFamily: 'PoppinsRegular',
    color: COLORS.GRAY_DARK,
  },
  requestMessageContainer: {
    backgroundColor: COLORS.BACKGROUND,
    padding: SPACING.SMALL,
    borderRadius: 8,
    marginBottom: SPACING.SMALL,
  },
  requestMessageLabel: {
    fontFamily: 'PoppinsSemiBold',
    color: COLORS.PRIMARY_BROWN,
    marginBottom: SPACING.TINY,
  },
  requestMessage: {
    fontFamily: 'PoppinsItalic',
    color: COLORS.GRAY_DARK,
    lineHeight: 18,
  },

  requestActions: {
    marginBottom: SPACING.SMALL,
  },
  requestActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MEDIUM,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    gap: SPACING.SMALL,
  },
  declineButton: {
    backgroundColor: COLORS.ERROR_RED,
  },
  requestActionText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.CARD_BACKGROUND,
  },
  requestNote: {
    fontFamily: 'PoppinsItalic',
    color: COLORS.GRAY_DARK,
    textAlign: 'center',
    opacity: 0.8,
  },
  managementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.MEDIUM,
    borderRadius: DESIGN_CONSTANTS.BORDER_RADIUS,
    marginBottom: SPACING.MEDIUM,
    gap: SPACING.SMALL,
  },
  managementButtonText: {
    fontFamily: 'PoppinsBold',
    color: COLORS.CARD_BACKGROUND,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default ShelterPetManagePage;


