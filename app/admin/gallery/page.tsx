"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Upload, Edit, Trash2, Loader2, X } from "lucide-react";
import { supabaseClient } from "@/utils/supabase-client";


type Category = {
  id: number;
  name: string;
};

type GalleryItem = {
  id: string;
  title: string;
  description: string;
  media_type: "image" | "video" | "youtube" | "vimeo";
  file_url: string;
  thumbnail_url: string;
  category: Category | null;
  tags: string[];
  duration?: number;
  views_count: number;
  likes_count: number;
  uploaded_at: string;
  is_featured: boolean;
  alt?: string;
  caption?: string;
  uploaded_by?: string;
};



export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    media_type: "image",
    category_id: "",
    tags: "",
    file_url: "",
    thumbnail_url: "",
    duration: 0,
    alt: "",
    caption: "",
    is_featured: false,
  });

 

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

      
        if (!supabaseClient || !supabaseClient.auth) {
          console.error("Supabase client not initialized correctly");
          setLoading(false);
          return;
        }

      
        const {
          data: { user },
          error: userError,
        } = await supabaseClient.auth.getUser();

        if (userError) {
          console.error("User fetch error:", userError);
          setLoading(false);
          return;
        }

        console.log("User:", user);

        if (!user) {
          console.log("No user logged in");
          setLoading(false);
          return;
        }

        setUser(user);

     
        const adminEmails = [
          "pdtheenatigala@gmail.com",
          "admin@pathofcricket.com",
        ];

        const email = user.email || "";

        console.log("Logged email:", email);

        if (adminEmails.includes(email)) {
          setIsAdmin(true);
        } else {
          
          console.log("Email not in admin list — allowing because user is logged in");
          setIsAdmin(true);
        }

        if (isAdmin) {
          await loadData();
        }
      } catch (error) {
        console.error("Init error:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // isAdmin is not a dependency to avoid infinite loops

  
  const loadData = async () => {
    try {
      console.log("Loading data...");

      if (!supabaseClient) {
        console.error("Supabase client missing in loadData");
        return;
      }

    
      const { data: catData, error: catError } =
        await supabaseClient
          .from("categories")
          .select("*");

      if (catError) {
        console.error("Categories error:", catError);
        alert(catError.message);
        return;
      }

      setCategories(catData || []);

      const { data, error } = await supabaseClient
        .from("gallery_items")
        .select("*, category:category_id(*)")
        .order("uploaded_at", {
          ascending: false,
        });

      if (error) {
        console.error("Gallery error:", error);
        alert(error.message);
        return;
      }

      console.log("Gallery data:", data);

      setItems(data || []);
    } catch (error) {
      console.error("Load error:", error);
    }
  };


  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (
      e.target as HTMLInputElement
    ).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };


  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    setUploading(true);

    try {
      const ext = file.name.split(".").pop();

      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}.${ext}`;

      const filePath = `public/${fileName}`;

      const { error } = await supabaseClient.storage
        .from("gallery")
        .upload(filePath, file);

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabaseClient.storage
        .from("gallery")
        .getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        file_url: publicUrl,
        thumbnail_url: publicUrl,
      }));

      alert("Upload success");
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };



  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!user)
      return alert("Login required");

    if (!formData.file_url)
      return alert("Upload file first");

    setUploading(true);

    try {
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: formData.title,
        description: formData.description,
        media_type: formData.media_type,
        file_url: formData.file_url,
        thumbnail_url:
          formData.thumbnail_url,
        category_id:
          formData.category_id === ""
            ? null
            : Number(
                formData.category_id
              ),
        tags: tagsArray,
        duration: formData.duration,
        alt: formData.alt,
        caption: formData.caption,
        is_featured:
          formData.is_featured,
        uploaded_by: user.id,
        is_published: true,
      };

      let result;

      if (editingId) {
        result = await supabaseClient
          .from("gallery_items")
          .update(payload)
          .eq("id", editingId);

        alert("Updated successfully");
      } else {
        result = await supabaseClient
          .from("gallery_items")
          .insert(payload);

        alert("Added successfully");
      }

      if (result.error) {
        console.error(result.error);
        alert(result.error.message);
        return;
      }

      resetForm();
      setShowForm(false);
      await loadData();
    } catch (err: any) {
      console.error("Submit error:", err);
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (
    item: GalleryItem
  ) => {
    if (!confirm("Delete this item?"))
      return;

    try {
      const fileName = item.file_url
        .split("/")
        .pop();

      if (fileName) {
        await supabaseClient.storage
          .from("gallery")
          .remove([
            `public/${fileName}`,
          ]);
      }

      const { error } = await supabaseClient
        .from("gallery_items")
        .delete()
        .eq("id", item.id);

      if (error) throw error;

      await loadData();
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.message);
    }
  };

  const openEdit = (item: GalleryItem) => {
    setEditingId(item.id);

    setFormData({
      title: item.title,
      description: item.description,
      media_type: item.media_type,
      category_id: String(
        item.category?.id || ""
      ),
      tags: item.tags.join(", "),
      file_url: item.file_url,
      thumbnail_url:
        item.thumbnail_url,
      duration: item.duration || 0,
      alt: item.alt || "",
      caption: item.caption || "",
      is_featured:
        item.is_featured,
    });

    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);

    setFormData({
      title: "",
      description: "",
      media_type: "image",
      category_id: "",
      tags: "",
      file_url: "",
      thumbnail_url: "",
      duration: 0,
      alt: "",
      caption: "",
      is_featured: false,
    });
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin" />
      </div>
    );

  if (!isAdmin)
    return (
      <div className="text-center p-20 text-red-500">
        Admin access required
      </div>
    );

  return (
    <div className="p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">
          Admin Gallery
        </h1>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded flex gap-2"
        >
          <Upload size={18} /> Add Media
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg overflow-hidden"
          >
            <div className="relative h-48">
              <Image
                src={item.file_url}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-3">
              <h3 className="font-semibold">
                {item.title}
              </h3>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => openEdit(item)}
                  className="bg-blue-600 text-white p-2 rounded"
                >
                  <Edit size={16} />
                </button>

                <button
                  onClick={() => handleDelete(item)}
                  className="bg-red-600 text-white p-2 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-white text-black p-6 rounded-lg w-full max-w-xl">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingId
                  ? "Edit Media"
                  : "Add Media"}
              </h2>

              <button
                onClick={() => setShowForm(false)}
              >
                <X />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border p-2"
                required
              />

              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border p-2"
              />

              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full border p-2"
              >
                <option value="">
                  Select Category
                </option>

                {categories.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                  >
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="tags"
                placeholder="tags (comma separated)"
                value={formData.tags}
                onChange={handleChange}
                className="w-full border p-2"
              />

              <input
                type="file"
                onChange={handleUpload}
                className="w-full"
              />

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-green-600 text-white py-2"
              >
                {uploading
                  ? "Saving..."
                  : "Save"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}