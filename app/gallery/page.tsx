"use client";

import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import Image from "next/image";
import { Search, Filter, Heart, Eye, Play, Upload, X, Youtube, Film } from "lucide-react";
import { supabase } from "@/lib/supabase/client";   
type GalleryItem = {
  id: string;
  title: string;
  description: string;
  media_type: 'image' | 'video' | 'youtube' | 'vimeo';
  file_url: string;
  thumbnail_url: string;
  category: {
    id: number;
    name: string;
    slug: string;
    color: string;
    icon: string;
  };
  tags: string[];
  width: number;
  height: number;
  duration?: number;
  views_count: number;
  likes_count: number;
  uploaded_at: string;
  is_featured: boolean;
  wide?: boolean;
  tall?: boolean;
  alt?: string;
  caption?: string;
};

const defaultFilterButtons = [
  { id: 'all', label: 'ALL MOMENTS', slug: 'all-moments' },
  { id: 'champions', label: 'CHAMPIONS', slug: 'champions' },
  { id: 'batting', label: 'BEST BATTING', slug: 'best-batting' },
  { id: 'bowling', label: 'BEST BOWLING', slug: 'best-bowling' },
  { id: 'fielding', label: 'BEST FIELDING', slug: 'best-fielding' },
  { id: 'coaches', label: 'COACHES', slug: 'coaches' },
  { id: 'practice', label: 'PRACTICE/SESSIONS', slug: 'practice-sessions' },
  { id: 'team', label: 'TEAM PHOTOS', slug: 'team-photos' },
];

type UploadFormData = {
  title: string;
  description: string;
  media_type: 'image' | 'video' | 'youtube' | 'vimeo';
  category_id: string;
  tags: string;
  file_url: string;
  thumbnail_url: string;
  duration?: number;
};

export default function GalleryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);
  const [uploadForm, setUploadForm] = useState<UploadFormData>({
    title: '',
    description: '',
    media_type: 'image',
    category_id: '',
    tags: '',
    file_url: '',
    thumbnail_url: '',
    duration: 0,
  });
  const [uploading, setUploading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);

 
  const mountedRef = useRef(true);


  const staticGalleryData: GalleryItem[] = [
    {
      id: "1",
      title: "Team celebrating championship win",
      description: "🏆 National U-19 Winners: The final moment of glory!",
      media_type: 'image',
      file_url: "/Gallery.jpg",
      thumbnail_url: "/Gallery.jpg",
      category: {
        id: 1,
        name: "CHAMPIONS",
        slug: "champions",
        color: "yellow",
        icon: "🏆"
      },
      tags: ["champions", "team", "trophy", "final", "winning"],
      width: 800,
      height: 600,
      views_count: 150,
      likes_count: 45,
      uploaded_at: "2024-12-15",
      is_featured: true,
      wide: true,
      alt: "Team celebrating championship win",
      caption: "🏆 National U-19 Winners: The final moment of glory!"
    },
    {
      id: "2",
      title: "Player hitting a boundary shot",
      description: "🏏 Dasun Perera's match-winning 100.",
      media_type: 'image',
      file_url: "/Gallery1.jpg",
      thumbnail_url: "/Gallery1.jpg",
      category: {
        id: 2,
        name: "BEST BATTING",
        slug: "best-batting",
        color: "green",
        icon: "🏏"
      },
      tags: ["performance", "batting", "century", "runs"],
      width: 600,
      height: 800,
      views_count: 120,
      likes_count: 38,
      uploaded_at: "2024-12-10",
      is_featured: false,
      alt: "Player hitting a boundary shot",
      caption: "🏏 Dasun Perera's match-winning 100."
    },
    {
      id: "3",
      title: "Coach guiding young players in a drill",
      description: "👨‍🏫 Head Coach's strategic fielding drill.",
      media_type: 'image',
      file_url: "/Gallery2.jpg",
      thumbnail_url: "/Gallery2.jpg",
      category: {
        id: 3,
        name: "COACHES",
        slug: "coaches",
        color: "blue",
        icon: "👨‍🏫"
      },
      tags: ["coaches", "training", "sessions", "drills", "mentor"],
      width: 600,
      height: 900,
      views_count: 95,
      likes_count: 32,
      uploaded_at: "2024-12-05",
      is_featured: false,
      tall: true,
      alt: "Coach guiding young players in a drill",
      caption: "👨‍🏫 Head Coach's strategic fielding drill."
    },
    {
      id: "4",
      title: "Bowler celebrating a wicket",
      description: "🔥 Tharindu's stunning 5-wicket haul!",
      media_type: 'image',
      file_url: "/Gallery3.jpg",
      thumbnail_url: "/Gallery3.jpg",
      category: {
        id: 4,
        name: "BEST BOWLING",
        slug: "best-bowling",
        color: "red",
        icon: "🔥"
      },
      tags: ["performance", "bowling", "wicket", "strike", "celebration"],
      width: 700,
      height: 700,
      views_count: 110,
      likes_count: 40,
      uploaded_at: "2024-12-08",
      is_featured: true,
      alt: "Bowler celebrating a wicket",
      caption: "🔥 Tharindu's stunning 5-wicket haul!"
    },
    {
      id: "5",
      title: "Players training hard in the nets",
      description: "💪 Dedication in the morning net session.",
      media_type: 'image',
      file_url: "/Gallery4.jpg",
      thumbnail_url: "/Gallery4.jpg",
      category: {
        id: 5,
        name: "PRACTICE/SESSIONS",
        slug: "practice-sessions",
        color: "purple",
        icon: "💪"
      },
      tags: ["practice", "nets", "training", "fitness", "dedication"],
      width: 800,
      height: 500,
      views_count: 85,
      likes_count: 28,
      uploaded_at: "2024-12-03",
      is_featured: false,
      alt: "Players training hard in the nets",
      caption: "💪 Dedication in the morning net session."
    },
    {
      id: "6",
      title: "Fielder taking a spectacular catch",
      description: "🧤 Catch of the tournament: A diving effort!",
      media_type: 'image',
      file_url: "/Gallery5.jpg",
      thumbnail_url: "/Gallery5.jpg",
      category: {
        id: 6,
        name: "BEST FIELDING",
        slug: "best-fielding",
        color: "orange",
        icon: "🧤"
      },
      tags: ["performance", "fielding", "catch", "diving", "agility"],
      width: 750,
      height: 750,
      views_count: 130,
      likes_count: 42,
      uploaded_at: "2024-12-12",
      is_featured: true,
      alt: "Fielder taking a spectacular catch",
      caption: "🧤 Catch of the tournament: A diving effort!"
    },
    {
      id: "7",
      title: "Action shot from a selection trial match",
      description: "🔎 High-pressure selection match in progress.",
      media_type: 'image',
      file_url: "/Gallery6.jpg",
      thumbnail_url: "/Gallery6.jpg",
      category: {
        id: 7,
        name: "PRACTICE/SESSIONS",
        slug: "practice-sessions",
        color: "purple",
        icon: "🔎"
      },
      tags: ["practice", "selections", "match", "action", "trial"],
      width: 900,
      height: 500,
      views_count: 75,
      likes_count: 25,
      uploaded_at: "2024-12-02",
      is_featured: false,
      wide: true,
      alt: "Action shot from a selection trial match",
      caption: "🔎 High-pressure selection match in progress."
    },
    {
      id: "8",
      title: "Team posing with runners up trophy",
      description: "🥈 Proud Runners-Up in the Provincial Cup.",
      media_type: 'image',
      file_url: "/Gallery7.jpg",
      thumbnail_url: "/Gallery7.jpg",
      category: {
        id: 8,
        name: "TEAM PHOTOS",
        slug: "team-photos",
        color: "gray",
        icon: "🥈"
      },
      tags: ["runnersup", "team", "trophy", "provincial"],
      width: 800,
      height: 600,
      views_count: 100,
      likes_count: 35,
      uploaded_at: "2024-12-01",
      is_featured: false,
      alt: "Team posing with runners up trophy",
      caption: "🥈 Proud Runners-Up in the Provincial Cup."
    },
  ];

  useEffect(() => {
    mountedRef.current = true;

    const checkAuth = async () => {
      setIsCheckingAuth(true);
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          setUser(session.user);
          const userEmail = session.user.email;
          const userRole = session.user.user_metadata?.role;
          const isUserAdmin = userEmail?.endsWith('@admin.com') || userRole === 'admin';
          setIsAdmin(!!isUserAdmin);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.log("No active session or error checking auth:", error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        if (mountedRef.current) setIsCheckingAuth(false);
      }
    };

    checkAuth();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loadGalleryData = () => {
      setIsLoading(true);
      try {

        setGalleryItems(staticGalleryData);
        setFilteredItems(staticGalleryData);
        
        
        const uniqueCategories = Array.from(
          new Map(
            staticGalleryData.map(item => [item.category.id, item.category])
          ).values()
        );
        setCategories(uniqueCategories);
        
      } catch (error) {
        console.error("Error loading gallery data:", error);
        setGalleryItems([]);
        setFilteredItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadGalleryData();
  }, []);


  useEffect(() => {
    const filtered = galleryItems.filter((item) => {
      const matchesFilter = 
        activeFilter === "all" || 
        item.category?.slug === activeFilter ||
        item.tags?.some(tag => tag.toLowerCase() === activeFilter.toLowerCase());

      const matchesSearch =
        searchTerm === "" ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesFilter && matchesSearch;
    });

    setFilteredItems(filtered);
  }, [searchTerm, activeFilter, galleryItems]);

  const handleFilterClick = (filterId: string) => {
    setActiveFilter(filterId);
  };

  const handleLikeClick = async (itemId: string) => {
    try {
      setGalleryItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, likes_count: item.likes_count + 1 }
          : item
      ));
      setFilteredItems(prev => prev.map(item => 
        item.id === itemId 
          ? { ...item, likes_count: item.likes_count + 1 }
          : item
      ));
      
    } catch (error: any) {
      console.error("Error toggling like:", error);
    }
  };

  const handleUploadFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUploadForm(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 0 : value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    if (!mountedRef.current) return;
    
    setUploading(true);
    try {
      if (!user) {
        alert('You must be logged in to upload files');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('gallery') 
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(data.path);
      
      setUploadForm(prev => ({
        ...prev,
        file_url: publicUrl,
        thumbnail_url: uploadForm.media_type === 'image' ? publicUrl : ''
      }));
      
      alert('File uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      if (error.message?.includes('Auth') || error.message?.includes('session')) {
        alert('Your session has expired. Please sign in again.');
        setUser(null);
        setIsAdmin(false);
      } else {
        alert('Error uploading file: ' + (error.message || 'Unknown error'));
      }
    } finally {
      if (mountedRef.current) setUploading(false);
    }
  };


  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.title || !uploadForm.file_url) {
      alert('Please fill in all required fields');
      return;
    }

    if (!mountedRef.current) return;
    
    setUploading(true);
    try {
      if (!user) {
        alert('You must be logged in to upload');
        return;
      }

      const tagsArray = uploadForm.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const mediaData = {
        title: uploadForm.title,
        description: uploadForm.description,
        media_type: uploadForm.media_type,
        file_url: uploadForm.file_url,
        thumbnail_url: uploadForm.thumbnail_url || uploadForm.file_url,
        uploaded_by: user.id,
        tags: tagsArray,
        is_published: true,
        category_id: uploadForm.category_id ? parseInt(uploadForm.category_id) : null,
        duration: uploadForm.media_type === 'video' ? uploadForm.duration : null,
        views_count: 0,
        likes_count: 0,
        uploaded_at: new Date().toISOString()
      };

      const { data, error: insertError } = await supabase
        .from('gallery')
        .insert([mediaData])
        .select()
        .single();

      if (insertError) throw insertError;

      alert('Media uploaded successfully!');
      setShowUploadForm(false);
      setUploadForm({
        title: '',
        description: '',
        media_type: 'image',
        category_id: '',
        tags: '',
        file_url: '',
        thumbnail_url: '',
        duration: 0,
      });
      
      if (data) {
        const categoryObj = categories.find(cat => cat.id === parseInt(uploadForm.category_id)) || {
          id: 0,
          name: "Uncategorized",
          slug: "uncategorized",
          color: "gray",
          icon: "📷"
        };
        const newItem: GalleryItem = {
          id: data.id,
          title: data.title,
          description: data.description,
          media_type: data.media_type,
          file_url: data.file_url,
          thumbnail_url: data.thumbnail_url,
          category: categoryObj,
          tags: data.tags,
          width: 800,
          height: 600,
          views_count: 0,
          likes_count: 0,
          uploaded_at: data.uploaded_at,
          is_featured: false,
          alt: data.title,
          caption: data.description,
          duration: data.duration
        };
        setGalleryItems(prev => [newItem, ...prev]);
      }
    } catch (error: any) {
      console.error('Error uploading media:', error);
      if (error.message?.includes('Auth') || error.message?.includes('session')) {
        alert('Your session has expired. Please sign in again.');
        setUser(null);
        setIsAdmin(false);
      } else {
        alert(`Error uploading media: ${error.message || 'Unknown error'}`);
      }
    } finally {
      if (mountedRef.current) setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMedia = (item: GalleryItem) => {
    if (item.media_type === 'video') {
      return (
        <div className="relative w-full h-full">
          <video
            src={item.file_url}
            className="w-full h-full object-cover"
            poster={item.thumbnail_url}
            onClick={() => setSelectedMedia(item)}
          />
          <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
            {formatDuration(item.duration)}
          </div>
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
            <Play size={12} /> Video
          </div>
        </div>
      );
    } else if (item.media_type === 'youtube') {
      return (
        <div 
          className="relative w-full h-full cursor-pointer"
          onClick={() => setSelectedMedia(item)}
        >
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <Youtube size={48} className="mx-auto text-red-600" />
              <p className="mt-2 text-sm">YouTube Video</p>
              <p className="text-xs text-gray-400">Click to play</p>
            </div>
          </div>
          <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-sm">
            YouTube
          </div>
        </div>
      );
    } else if (item.media_type === 'vimeo') {
      return (
        <div 
          className="relative w-full h-full cursor-pointer"
          onClick={() => setSelectedMedia(item)}
        >
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <div className="text-center">
              <Film size={48} className="mx-auto text-blue-600" />
              <p className="mt-2 text-sm">Vimeo Video</p>
              <p className="text-xs text-gray-400">Click to play</p>
            </div>
          </div>
          <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded text-sm">
            Vimeo
          </div>
        </div>
      );
    } else {
      return (
        <Image
          src={item.file_url || '/placeholder.jpg'}
          alt={item.alt || item.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onClick={() => setSelectedMedia(item)}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.jpg';
          }}
        />
      );
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-400">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <Header />

      <div className="relative pt-24 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 via-black to-green-900/10"></div>
        
        <div className="relative max-w-7xl mx-auto">
          {/* Logo Container */}
          <div className="flex justify-center items-center mb-8">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-0 border-yellow-600 shadow-lg shadow-yellow-500/10">
              <Image
                src="/image55.png"
                alt="Path of Cricket Logo"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 128px, 160px"
                priority
              />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-6xl md:text-6xl lg:text-6xl font-bold text-yellow-400 uppercase tracking-wider mb-4">
              PATH OF CRICKET
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto">
              Where Talent Meets Opportunity
            </p>
            
            <div className="mt-8 w-32 h-1 bg-yellow-1000 mx-auto rounded-full"></div>
          </div>
        </div>
      </div>

      <main className="pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-400 uppercase tracking-wide mb-4">
            VISUAL TALENT SHOWCASE
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Explore the dedication, glory, and spirit of Path of Cricket through photos and videos.
          </p>
          
    
          {isAdmin && (
            <div className="mt-6">
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors"
              >
                <Upload size={20} />
                Upload New Media
              </button>
            </div>
          )}
          
          {user && (
            <div className="mt-4 text-sm text-gray-400">
              Signed in as {user.email}
            </div>
          )}
        </div>

        <div className="bg-gray-900/70 backdrop-blur-sm rounded-2xl p-6 mb-10 border border-gray-800 shadow-2xl">
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={22} />
            <input
              type="text"
              placeholder="Search for player names, teams, or moments..."
              className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {defaultFilterButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleFilterClick(btn.slug)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${activeFilter === btn.slug
                    ? "bg-green-600 text-black font-bold"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>


        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-400">Loading gallery...</p>
          </div>
        ) : (
          <>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`relative group overflow-hidden rounded-xl border-2 border-transparent hover:border-yellow-500 transition-all duration-300 ${
                      item.wide ? 'sm:col-span-2 lg:col-span-2' : ''
                    } ${item.tall ? 'sm:row-span-2' : ''}`}
                  >
                 
                    <div className={`relative w-full ${
                      item.tall ? 'h-96 md:h-[500px]' : 'h-64 md:h-80'
                    }`}>
                      {renderMedia(item)}
                      
                
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
               
                      <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          <Eye size={12} /> {item.views_count}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLikeClick(item.id);
                          }}
                          className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition"
                        >
                          <Heart 
                            size={12} 
                            className={item.likes_count > 0 ? 'fill-white' : ''} 
                          /> 
                          {item.likes_count}
                        </button>
                      </div>
                    </div>

                  
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          item.category?.color === 'yellow' ? 'bg-yellow-900 text-yellow-300' : 
                          item.category?.color === 'red' ? 'bg-red-900 text-red-300' :
                          item.category?.color === 'blue' ? 'bg-blue-900 text-blue-300' :
                          item.category?.color === 'green' ? 'bg-green-900 text-green-300' :
                          item.category?.color === 'purple' ? 'bg-purple-900 text-purple-300' :
                          item.category?.color === 'orange' ? 'bg-orange-900 text-orange-300' :
                          item.category?.color === 'gray' ? 'bg-gray-700 text-gray-300' :
                          'bg-gray-800 text-gray-300'
                        }`}>
                          {item.category?.name || 'Uncategorized'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(item.uploaded_at)}
                        </span>
                      </div>
                      <h3 className="text-white font-semibold text-sm md:text-base line-clamp-2">
                        {item.title}
                      </h3>
                      {item.caption && (
                        <p className="text-gray-300 text-xs mt-1 line-clamp-1">
                          {item.caption}
                        </p>
                      )}
                    </div>

              
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                      {item.tags?.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-black/70 text-xs text-gray-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags && item.tags.length > 3 && (
                        <span className="px-2 py-1 bg-black/70 text-xs text-gray-300 rounded">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>

           
                    {item.is_featured && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-yellow-600 text-black text-xs font-bold rounded">
                          FEATURED
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <Filter className="mx-auto mb-4 text-gray-500" size={48} />
                  <h3 className="text-xl font-semibold text-gray-400">
                    No media found
                  </h3>
                  <p className="text-gray-500 mt-2">
                    Try a different search or filter
                  </p>
                </div>
              )}
            </div>

   
            <div className="mt-10 text-center text-gray-400">
              Showing {filteredItems.length} of {galleryItems.length} media items
            </div>
          </>
        )}
      </main>


      {selectedMedia && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl max-h-[90vh]">
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute -top-10 right-0 text-white hover:text-yellow-400 z-10"
            >
              <X size={32} />
            </button>
            
            <div className="bg-gray-900 rounded-xl overflow-hidden">
              {selectedMedia.media_type === 'image' ? (
                <div className="relative h-[70vh]">
                  <Image
                    src={selectedMedia.file_url}
                    alt={selectedMedia.alt || selectedMedia.title}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.jpg';
                    }}
                  />
                </div>
              ) : selectedMedia.media_type === 'video' ? (
                <video
                  src={selectedMedia.file_url}
                  className="w-full h-[70vh] object-contain"
                  controls
                  autoPlay
                />
              ) : selectedMedia.media_type === 'youtube' ? (
                <div className="relative h-[70vh]">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedMedia.file_url.split('v=')[1] || selectedMedia.file_url.split('/').pop()}`}
                    className="w-full h-full"
                    allowFullScreen
                    title={selectedMedia.title}
                  />
                </div>
              ) : selectedMedia.media_type === 'vimeo' ? (
                <div className="relative h-[70vh]">
                  <iframe
                    src={`https://player.vimeo.com/video/${selectedMedia.file_url.split('/').pop()}`}
                    className="w-full h-full"
                    allowFullScreen
                    title={selectedMedia.title}
                  />
                </div>
              ) : null}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedMedia.title}</h3>
                    <p className="text-gray-300 mt-2">{selectedMedia.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Eye size={20} className="text-gray-400" />
                      <span className="text-gray-300">{selectedMedia.views_count}</span>
                    </div>
                    <button
                      onClick={() => handleLikeClick(selectedMedia.id)}
                      className="flex items-center gap-2 hover:text-red-400 transition"
                    >
                      <Heart 
                        size={20} 
                        className={selectedMedia.likes_count > 0 ? 'fill-current' : ''} 
                      />
                      <span>{selectedMedia.likes_count}</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedMedia.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                
                <div className="text-sm text-gray-400">
                  <p>Uploaded: {formatDate(selectedMedia.uploaded_at)}</p>
                  <p className="mt-1">Category: {selectedMedia.category?.name || 'Uncategorized'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    
      {showUploadForm && isAdmin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-yellow-400">Upload New Media</h3>
              <button
                onClick={() => setShowUploadForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={uploadForm.title}
                  onChange={handleUploadFormChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  placeholder="Enter media title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  name="description"
                  value={uploadForm.description}
                  onChange={handleUploadFormChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  placeholder="Enter description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Media Type *</label>
                  <select 
                    name="media_type" 
                    value={uploadForm.media_type}
                    onChange={handleUploadFormChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Category</label>
                  <select 
                    name="category_id"
                    value={uploadForm.category_id}
                    onChange={handleUploadFormChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={uploadForm.tags}
                  onChange={handleUploadFormChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                  placeholder="e.g., batting, team, championship (comma separated)"
                />
              </div>
              
              {uploadForm.media_type === 'youtube' || uploadForm.media_type === 'vimeo' ? (
                <div>
                  <label className="block text-gray-300 mb-2">Video URL *</label>
                  <input
                    type="url"
                    name="file_url"
                    value={uploadForm.file_url}
                    onChange={handleUploadFormChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                    placeholder={`Enter ${uploadForm.media_type} video URL`}
                    required
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-gray-300 mb-2">Upload File *</label>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                      accept={uploadForm.media_type === 'image' ? 'image/*' : 'video/*'}
                      required={!uploadForm.file_url}
                    />
                    {uploadForm.file_url && (
                      <p className="text-green-400 text-sm mt-2">
                        File uploaded: {uploadForm.file_url.split('/').pop()}
                      </p>
                    )}
                  </div>
                  
                  {uploadForm.media_type === 'video' && (
                    <div>
                      <label className="block text-gray-300 mb-2">Duration (seconds)</label>
                      <input
                        type="number"
                        name="duration"
                        value={uploadForm.duration}
                        onChange={handleUploadFormChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white"
                        placeholder="Enter video duration in seconds"
                        min="0"
                      />
                    </div>
                  )}
                </>
              )}
              
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  {uploading ? 'Uploading...' : 'Upload Media'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}